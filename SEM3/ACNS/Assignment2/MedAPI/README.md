# Medical Image Analysis API

A Python API that serves as a bridge between web applications and AI models for medical image detection and classification.

## Features

- RESTful API for medical image analysis
- Support for multiple pre-trained models
- Integration with Huggingface AI models
- CORS support for web application access
- Robust error handling and logging

## Setup

### Prerequisites

- Python 3.8 or later
- Node.js 14 or later

### Installation

1. Clone this repository

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r api/requirements.txt
   ```

### Running the Application

1. Start the Python API:
   ```
   python api/app.py
   ```

2. In a separate terminal, start the Node.js server:
   ```
   npm start
   ```

3. Access the application at:
   - Web Interface: http://localhost:3000
   - Python API: http://localhost:5000

## API Endpoints

### POST /api/analyze

Analyze a medical image using AI models.

**Request:**
- Content-Type: multipart/form-data
- Parameters:
  - `image`: The image file to analyze
  - `model`: The model to use (medical-detection or medical-classification)

**Response:**
```json
{
  "success": true,
  "model": "medical-detection",
  "results": [
    {
      "label": "Pneumonia",
      "confidence": 0.92,
      "bbox": [50, 50, 200, 150]
    }
  ],
  "processing_time": "1.2s"
}
```

### GET /api/models

List available AI models.

**Response:**
```json
{
  "models": [
    {
      "id": "medical-detection",
      "name": "Medical Object Detection",
      "description": "Detects medical conditions and anomalies in images",
      "type": "detection",
      "source": "huggingface"
    },
    {
      "id": "medical-classification",
      "name": "Medical Image Classification",
      "description": "Classifies medical images into categories",
      "type": "classification",
      "source": "huggingface"
    }
  ]
}
```

## Folder Structure

```
/
├── api/                  # Python API
│   ├── app.py            # Main Flask application
│   ├── models.py         # Model implementations
│   ├── utils.py          # Utility functions
│   ├── requirements.txt  # Python dependencies
│   └── uploads/          # Temporary storage for uploaded files
├── public/               # Static files for web interface
│   ├── index.html        # Main HTML page
│   ├── styles.css        # CSS styles
│   └── script.js         # Frontend JavaScript
├── index.js              # Node.js server entry point
├── package.json          # Node.js dependencies
└── README.md             # Project documentation
```

## Using with Huggingface Models

To use actual Huggingface models:

1. Uncomment the transformers, torch, and torchvision dependencies in `api/requirements.txt`
2. Install the dependencies: `pip install -r api/requirements.txt`
3. Modify the model implementations in `api/models.py` to use actual models

Example implementation:

```python
from transformers import AutoProcessor, AutoModelForObjectDetection

class MedicalDetectionModel(BaseMedicalModel):
    def __init__(self, name: str = "medical-detection-model"):
        super().__init__(name, "detection")
        self.model = AutoModelForObjectDetection.from_pretrained("facebook/detr-resnet-50")
        self.processor = AutoProcessor.from_pretrained("facebook/detr-resnet-50")
    
    def predict(self, image):
        inputs = self.processor(images=image, return_tensors="pt")
        outputs = self.model(**inputs)
        results = self.processor.post_process_object_detection(outputs)
        # Process results
        return results
```

## License

MIT License