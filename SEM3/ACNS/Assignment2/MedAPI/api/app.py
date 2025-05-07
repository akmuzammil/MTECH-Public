from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import logging
from werkzeug.utils import secure_filename
from PIL import Image
import io
import json

# Import medical image analysis modules
from models import get_model, list_available_models
from utils import preprocess_image, format_results, setup_logging

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
setup_logging()
logger = logging.getLogger(__name__)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return jsonify({
        "name": "Medical Image Analysis API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            {"path": "/api/analyze", "method": "POST", "description": "Analyze medical images"},
            {"path": "/api/models", "method": "GET", "description": "List available models"}
        ]
    })

@app.route('/api/models', methods=['GET'])
def models():
    return jsonify({
        "models": list_available_models()
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    start_time = time.time()
    
    # Check if the post request has the file part
    if 'image' not in request.files:
        logger.error("No image part in the request")
        return jsonify({
            "success": False,
            "error": "No image file provided"
        }), 400
    
    file = request.files['image']
    
    # If user does not select file, browser might submit an empty file
    if file.filename == '':
        logger.error("No selected file")
        return jsonify({
            "success": False,
            "error": "No file selected"
        }), 400
    
    # Get the model type from the request
    model_type = request.form.get('model', 'medical-classification')
    
    if file and allowed_file(file.filename):
        try:
            # Secure the filename and save the file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            logger.info(f"Saved file to {filepath}")
            
            # Load and preprocess the image
            image = Image.open(filepath)
            processed_image = preprocess_image(image, model_type)
            
            # Get the model and run inference
            model = get_model(model_type)
            results = model.predict(processed_image)
            
            print(results)
            # Format the results
            formatted_results = format_results(results, model_type)
            #print(formatted_results)
            # Log the results
            logger.info(f"Results: {json.dumps(formatted_results, indent=2)}")
            # Calculate processing time
            processing_time = time.time() - start_time

            if(model_type == "medical-classification"):
                # Return the results
                return jsonify({
                    "success": True,
                    "model": model_type,
                    "results": results,
                    "processing_time": f"{processing_time:.2f}s"
                })
            elif(model_type == "medical-detection"): 
                # Return the results
                return jsonify({
                    "success": True,
                    "model": model_type,
                    "results": formatted_results,
                    "processing_time": f"{processing_time:.2f}s"
                })
            
            
        except Exception as e:
            logger.exception("Error processing image")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
        finally:
            # Clean up the uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    else:
        logger.error(f"Invalid file type: {file.filename}")
        return jsonify({
            "success": False,
            "error": "Invalid file type. Allowed types: png, jpg, jpeg"
        }), 400

if __name__ == '__main__':
    logger.info("Starting Medical Image Analysis API")
    app.run(debug=True, host='0.0.0.0', port=5000)