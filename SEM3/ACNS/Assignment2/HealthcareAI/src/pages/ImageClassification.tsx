import React, { useEffect, useState } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { Card, CardGrid } from '../components/Card';
import ImageUploader from '../components/ImageUploader';
import { useAIStore } from '../store';
import { mockImageClassification } from '../services/mockApiService';
import { classifyImage } from '../services/aiService';
import { ImageClassificationResult, ImagePrediction } from '../types';

const ImageClassification: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { 
    imageClassificationResult,
    loadingImageClassification,
    setImageClassificationLoading,
    setImageClassificationResult,
    clearResults
  } = useAIStore();

  useEffect(() => {
    clearResults();
  }, [clearResults]);

  const handleImageUpload = async (file: File) => {
    setSelectedImage(file);
    setImageClassificationLoading(true);
    
    try {
      const result = await classifyImage(file);
      //console.log('Image classification result:', result);
      const imgResult = deserializeImageClassificationResult(result);
      setImageClassificationResult(file.name, imgResult);
    } catch (error) {
      console.error('Error classifying image:', error);
    } finally {
      setImageClassificationLoading(false);
    }
  };
  function deserializeImageClassificationResult(apiResponse: any): ImageClassificationResult {
    if (!apiResponse.predictions || !apiResponse.predictions.results) {
      console.error("Invalid API response:", apiResponse);
      throw new Error("Invalid API response: 'predictions.results' field is missing.");
    }
    return {
      success: apiResponse.predictions.success,
      model: apiResponse.predictions.model,
      processing_time: apiResponse.predictions.processing_time,
      results: {
        label: apiResponse.predictions.results.label || "Unknown",
        confidence: apiResponse.predictions.results.confidence || 0,
      },
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Medical Image Classification</h1>
        <p className="text-muted-foreground">
          Upload medical images for automated analysis and classification using our advanced AI models.
        </p>
      </div>

      <CardGrid columns={2}>
        <Card title="Image Upload">
          <ImageUploader
            onImageUpload={handleImageUpload}
            onImageRemove={() => {setSelectedImage(null);clearResults();}}
            acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
            maxSize={5242880}
            className="p-4"
          />
          
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground border-t">
            <AlertCircle className="h-4 w-4" />
            <p>Supported formats: JPEG, PNG, GIF (max 5MB)</p>
          </div>
        </Card>

        {imageClassificationResult && (
          <Card title="Classification Results">
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Label:</span>
                  <span className="text-sm text-muted-foreground">{imageClassificationResult.results.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Confidence:</span>
                  <span className="text-sm text-muted-foreground">
                    {(imageClassificationResult.results.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Model:</span>
                  <span className="text-sm text-muted-foreground">{imageClassificationResult.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Processing Time:</span>
                  <span className="text-sm text-muted-foreground">{imageClassificationResult.processing_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Success:</span>
                  <span className="text-sm text-muted-foreground">{imageClassificationResult.success ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </CardGrid>

      {loadingImageClassification && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-primary">
            <ImageIcon className="h-5 w-5 animate-pulse" />
            <span>Analyzing image...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageClassification;