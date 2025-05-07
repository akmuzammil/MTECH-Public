// This file now serves as a fallback when API keys are not configured
import { 
  TextAnalysisResult, 
  QuestionAnsweringResult, 
  DiseasePredictionResult, 
  ImageClassificationResult,
  ModelMetrics
} from '../types';
import { delay } from '../lib/utils';

// Mock data for development purposes
export const mockTextAnalysis = async (text: string): Promise<TextAnalysisResult> => {
  await delay(1500); // Simulate API latency
  
  return {
    entities: [
      { text: 'heart rate', type: 'Symptom', score: 0.89 },
      { text: 'shortness of breath', type: 'Symptom', score: 0.92 },
      { text: 'chest pain', type: 'Symptom', score: 0.95 },
      { text: 'diabetes', type: 'Condition', score: 0.88 },
    ],
    sentiment: {
      label: 'neutral',
      score: 0.65
    },
    summary: 'Patient reports chest pain, shortness of breath, and increased heart rate. History of diabetes.',
    keywords: ['chest pain', 'shortness of breath', 'heart rate', 'diabetes']
  };
};

export const mockQuestionAnswering = async (question: string): Promise<QuestionAnsweringResult> => {
  await delay(1200);
  
  if (question.toLowerCase().includes('diabetes')) {
    return {
      answer: 'Diabetes is a chronic condition that affects how your body turns food into energy. If you have diabetes, your body either does not make enough insulin or cannot use the insulin it makes as well as it should. This leads to high blood sugar levels, which over time can cause serious health problems such as heart disease, vision loss, and kidney disease.',
      confidence: 0.92,
      sources: ['Mayo Clinic', 'American Diabetes Association']
    };
  }
  
  return {
    answer: 'Based on current medical research, maintaining a healthy lifestyle with regular exercise, balanced diet, adequate sleep, and stress management are key factors in preventing many chronic diseases. Regular check-ups with healthcare professionals are also important for early detection and treatment of potential health issues.',
    confidence: 0.75,
    sources: ['National Institutes of Health', 'Harvard Health']
  };
};

export const mockDiseasePrediction = async (symptoms: string): Promise<DiseasePredictionResult> => {
  await delay(1800);
  
  return {
    predictions: [
      { name: 'Common Cold', probability: 0.65, description: 'A viral infectious disease of the upper respiratory tract.' },
      { name: 'Seasonal Allergies', probability: 0.48, description: 'An allergic reaction to pollen and other airborne allergens.' },
      { name: 'Influenza', probability: 0.37, description: 'A contagious respiratory illness caused by influenza viruses.' }
    ],
    confidence: 0.65
  };
};

export const mockImageClassification = async (image: File): Promise<ImageClassificationResult> => {
  await delay(2000);
  
  return {
    predictions: [
      { label: 'Normal Retina', score: 0.82 },
      { label: 'Diabetic Retinopathy', score: 0.11 },
      { label: 'Age-related Macular Degeneration', score: 0.07 }
    ]
  };
};

export const getMockMetrics = (modelType: string): ModelMetrics => {
  switch (modelType) {
    case 'textAnalysis':
      return {
        accuracy: 87.5,
        precision: 0.84,
        recall: 0.81,
        f1Score: 0.82,
        latency: 245
      };
    case 'questionAnswering':
      return {
        accuracy: 92.3,
        precision: 0.89,
        recall: 0.87,
        f1Score: 0.88,
        latency: 320
      };
    case 'diseasePrediction':
      return {
        accuracy: 78.6,
        precision: 0.76,
        recall: 0.72,
        f1Score: 0.74,
        latency: 380
      };
    case 'imageClassification':
      return {
        accuracy: 89.4,
        precision: 0.87,
        recall: 0.85,
        f1Score: 0.86,
        latency: 420
      };
    default:
      return {
        accuracy: 85.0,
        precision: 0.82,
        recall: 0.80,
        f1Score: 0.81,
        latency: 300
      };
  }
};