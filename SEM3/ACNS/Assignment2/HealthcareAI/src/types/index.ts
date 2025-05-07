export interface TextAnalysisResult {
  entities: Entity[];
  sentiment: Sentiment;
  summary: string;
  keywords: string[];
}

export interface Entity {
  text: string;
  type: string;
  score: number;
}

export interface Sentiment {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
}

// export interface QuestionAnsweringResult {
//   answer: string;
//   confidence: number;
//   sources?: string[];
//   performance_metrics?: { };
// }
export type QuestionAnsweringResult =
  | {
      // Standard response format
      answer: string;
      confidence?: string;
      confidence_score?: string;
      sources?: string[];
      performance_metrics?: {};
    }
  | {
      // Structured response format
      definition: string;
      causes: string[];
      symptoms: string[];
      diagnosis: string;
      treatment: string;
      sources?: string[];
      confidence?: string;
      confidence_score?: string;
      types: string[];
    };
export interface DiseasePredictionResult {
  predictions: Disease[];
  overall_confidence: number;
}

export interface Disease {
  name: string;
  probability: number;
  description?: string;
}

export interface ImageClassificationResult {
  success: boolean;
  model: string;
  processing_time: string;
  results: ImagePrediction;
}

export interface ImagePrediction {
  label: string; // Array of labels
  confidence: number; // Array of confidence scores
  //bbox?: number[][]; // Optional bounding boxes (if included in the response)
}

export interface Metric {
  name: string;
  value: number;
  target?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  trendValue?: string;
  confidence?: number;
}