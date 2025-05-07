import logging
import os
import sys
from typing import List, Dict, Any, Union
from PIL import Image
import io
import torch

def setup_logging():
    """Set up logging configuration"""
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, 'api.log')
    
    # Configure the root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Create handlers
    console_handler = logging.StreamHandler(sys.stdout)
    file_handler = logging.FileHandler(log_file)
    
    # Create formatters
    console_format = logging.Formatter('%(levelname)s: %(message)s')
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Set formatters
    console_handler.setFormatter(console_format)
    file_handler.setFormatter(file_format)
    
    # Add handlers
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

def preprocess_image(image: Image.Image, model_type: str) -> Image.Image:
    """
    Preprocess an image for a specific model type
    
    Args:
        image: The input image
        model_type: The type of model to preprocess for
        
    Returns:
        The preprocessed image
    """
    # Common preprocessing steps
    # Convert to RGB if not already
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Model-specific preprocessing
    if model_type == 'medical-detection':
        # For detection, we might resize to a specific size
        image = image.resize((512, 512))
    elif model_type == 'medical-classification':
        # For classification, we might use a different size
        image = image.resize((299, 299))
    
    # In a real implementation, we would apply more preprocessing
    # such as normalization based on the model's requirements
    
    return image

def format_results(results: List[Dict[str, Any]], model_type: str) -> List[Dict[str, Any]]:
    """
    Format model results into a standardized structure
    
    Args:
        results: Raw results from the model
        model_type: The type of model that produced the results
        
    Returns:
        Formatted results
    """
    formatted = []
    logging.info(f"Raw results: {results}")

    # Handle list of dictionaries (e.g., detection results)
    if isinstance(results, list) and isinstance(results[0], dict):
        for item in results:
            result = {
                'label': item['labels'].tolist() if hasattr(item['labels'], 'tolist') else item['labels'],
                'confidence': item['scores'].tolist() if hasattr(item['scores'], 'tolist') else item['scores']
            }
            if model_type == 'medical-detection' and 'boxes' in item:
                result['bbox'] = item['boxes'].tolist() if hasattr(item['boxes'], 'tolist') else item['boxes']
            formatted.append(result)
    
    # Handle PyTorch tensor outputs (e.g., classification probabilities)
    elif isinstance(results, torch.Tensor):
        probabilities = results.softmax(dim=1)
        for i, prob in enumerate(probabilities):
            formatted.append({
                'label': int(prob.argmax().item()),  # Get the class index
                'confidence': float(prob.max().item())  # Get the max probability
            })
    
    # Handle dictionary with 'label' and 'confidence' keys
    elif isinstance(results, dict) and 'label' in results and 'confidence' in results:
        formatted.append({
            'label': results['label'],
            'confidence': results['confidence']
        })
    
    # Handle unsupported formats
    else:
        logging.error(f"Unsupported results format: {type(results)}")
        raise ValueError(f"Unsupported results format: {type(results)}")
    
    return formatted

def save_image_for_debugging(image: Image.Image, filename: str) -> str:
    """
    Save an image for debugging purposes
    
    Args:
        image: The image to save
        filename: The base filename
        
    Returns:
        The path to the saved file
    """
    debug_dir = os.path.join(os.path.dirname(__file__), 'debug')
    os.makedirs(debug_dir, exist_ok=True)
    
    filepath = os.path.join(debug_dir, filename)
    image.save(filepath)
    
    return filepath

def load_model_config(model_type: str) -> Dict[str, Any]:
    """
    Load configuration for a specific model type
    
    Args:
        model_type: The type of model to load configuration for
        
    Returns:
        Model configuration
    """
    config_dir = os.path.join(os.path.dirname(__file__), 'config')
    os.makedirs(config_dir, exist_ok=True)
    
    config_file = os.path.join(config_dir, f'{model_type}.json')
    
    # If config file doesn't exist, create a default one
    if not os.path.exists(config_file):
        default_config = {
            'name': f"{model_type}-default",
            'huggingface_model': None,
            'preprocessing': {
                'resize': [512, 512],
                'normalize': True
            }
        }
        
        with open(config_file, 'w') as f:
            import json
            json.dump(default_config, f, indent=2)
        
        return default_config
    
    # Load existing config
    with open(config_file, 'r') as f:
        import json
        return json.load(f)