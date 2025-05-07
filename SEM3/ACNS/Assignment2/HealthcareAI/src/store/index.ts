import { create } from 'zustand';
import { 
  TextAnalysisResult, 
  QuestionAnsweringResult, 
  DiseasePredictionResult, 
  ImageClassificationResult,
  ModelMetrics,
  ImagePrediction
} from '../types';
import { questionAnswering } from '@huggingface/inference';
import { Model } from 'openai/resources.mjs';

interface AIState {
  // Loading states
  loadingTextAnalysis: boolean;
  loadingQuestionAnswering: boolean;
  loadingDiseasePrediction: boolean;
  loadingImageClassification: boolean;
  
  // Results
  textAnalysisResult: TextAnalysisResult | null;
  questionAnsweringResult: QuestionAnsweringResult | null;
  diseasePredictionResult: DiseasePredictionResult | null;
  imageClassificationResult: ImageClassificationResult | null;
  
  // Metrics for each model
  textAnalysisMetrics: ModelMetrics | null;
  questionAnsweringMetrics: ModelMetrics | null;
  diseasePredictionMetrics: ModelMetrics | null;
  imageClassificationMetrics: ModelMetrics | null;
  
  // History
  history: {
    textAnalysis: { input: string; result: TextAnalysisResult }[];
    questionAnswering: { question: string; result: QuestionAnsweringResult ;metrics:ModelMetrics}[];
    diseasePrediction: { symptoms: string; result: DiseasePredictionResult }[];
    imageClassification: { imageName: string; result: ImageClassificationResult }[];
  };
  
  // Actions
  setTextAnalysisLoading: (loading: boolean) => void;
  setQuestionAnsweringLoading: (loading: boolean) => void;
  setDiseasePredictionLoading: (loading: boolean) => void;
  setImageClassificationLoading: (loading: boolean) => void;
  
  setTextAnalysisResult: (input: string, result: TextAnalysisResult) => void;
  setQuestionAnsweringResult: (question: string, result: QuestionAnsweringResult) => void;
  setDiseasePredictionResult: (symptoms: string, result: DiseasePredictionResult) => void;
  setImageClassificationResult: (imageName: string, result: ImageClassificationResult) => void;
  
  updateMetrics: (
    modelType: 'textAnalysis' | 'questionAnswering' | 'diseasePrediction' | 'imageClassification', 
    metrics: ModelMetrics
  ) => void;
  
  clearResults: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  // Loading states
  loadingTextAnalysis: false,
  loadingQuestionAnswering: false,
  loadingDiseasePrediction: false,
  loadingImageClassification: false,
  
  // Results
  textAnalysisResult: null,
  questionAnsweringResult: null,
  diseasePredictionResult: null,
  imageClassificationResult: null,
  
  // Metrics
  textAnalysisMetrics: null,
  questionAnsweringMetrics: null,
  diseasePredictionMetrics: null,
  imageClassificationMetrics: null,
  
  // History
  history: {
    textAnalysis: [],
    questionAnswering: [],
    diseasePrediction: [],
    imageClassification: [],
  },
  
  // Actions
  setTextAnalysisLoading: (loading) => set({ loadingTextAnalysis: loading }),
  setQuestionAnsweringLoading: (loading) => set({ loadingQuestionAnswering: loading }),
  setDiseasePredictionLoading: (loading) => set({ loadingDiseasePrediction: loading }),
  setImageClassificationLoading: (loading) => set({ loadingImageClassification: loading }),
  
  setTextAnalysisResult: (input, result) => set((state) => {
    
    // Extract metrics directly from the model's response
    const metrics = {
      accuracy: parseMetric(result.metrics?.accuracy),
      precision: parseMetric(result.metrics?.precision),
      recall: parseMetric(result.metrics?.recall),
      f1Score: parseMetric(result.metrics?.f1Score || result.metrics?.['F1 score']),
      trendValue: '0%',
    };
    // console.log('Metrics:', metrics);
    // // Calculate trend based on accuracy (or any other metric)
    // let trendValue = '0%';
    // if (newHistory.length > 1) {
    //   const latestAccuracy = metrics.accuracy;
    //   const previousAccuracy = newHistory[newHistory.length - 2].result.metrics?.accuracy || 0;

    //   if (previousAccuracy !== 0) {
    //     const trend = ((latestAccuracy - previousAccuracy) / previousAccuracy) * 100;
    //     metrics.trendValue = `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
    //   }
    // }
    // // Add the trend value to the metrics
    // console.log('Trend Value:', metrics.trendValue);
    const newHistory = [...state.history.textAnalysis, { input, result,metrics }].slice(-10);

    return {
      textAnalysisResult: result,
      textAnalysisMetrics: metrics,
      history: {
        ...state.history,
        textAnalysis: newHistory,
      },
    };
  }),
  
  setQuestionAnsweringResult: (question, result) => set((state) => {
    
    // Extract metrics from the performance_metrics field in the model's response
    const metrics = {
      accuracy: parseMetric(result.performance_metrics?.accuracy || result.model_performance_estimate?.accuracy),
      precision: parseMetric(result.performance_metrics?.precision || result.model_performance_estimate?.precision),
      recall: parseMetric(result.performance_metrics?.recall || result.model_performance_estimate?.recall),
      f1Score: parseMetric(result.performance_metrics?.f1Score || result.performance_metrics?.['f1 score'] || result.performance_metrics?.['f1_score'] || result.performance_metrics?.['F1_score'] || result.performance_metrics?.['F1 score'] || result.model_performance_estimate?.f1Score || result.model_performance_estimate?.['f1 score'] || result.model_performance_estimate?.['f1_score'] || result.model_performance_estimate?.['F1_score'] || result.model_performance_estimate?.['F1 score']),
      latency: parseMetric(result.performance_metrics?.latency),
      confidence: parseMetric(result.confidence || result.confidence_score || result.confidence_level|| result.performance_metrics?.confidence || result.performance_metrics?.confidence_score || result.performance_metrics?.confidence_level || result.model_performance_estimate?.confidence || result.model_performance_estimate?.confidence_score || result.model_performance_estimate?.confidence_level),
    };
    const newHistory = [...state.history.questionAnswering, { question, result,metrics }].slice(-10);
    return {
    questionAnsweringMetrics: metrics,
    questionAnsweringResult: result,
    history: {
      ...state.history,
      questionAnswering: newHistory,
    },
  };
  }),
  
  setDiseasePredictionResult: (symptoms, result) => set((state) => {
  
    // Extract metrics from the performance_metrics field in the model's response
    const metrics = {
      accuracy: parseMetric(result.performance_metrics?.accuracy || result.metrics?.accuracy),
      precision: parseMetric(result.performance_metrics?.precision || result.metrics?.precision),
      recall: parseMetric(result.performance_metrics?.recall || result.metrics?.recall),
      f1Score: parseMetric(result.performance_metrics?.f1_score || result.metrics?.f1_score),
      latency: parseMetric(result.performance_metrics?.latency || result.metrics?.latency),
      confidence: parseMetric(
      result.overall_confidence ||
      result.performance_metrics?.overall_confidence ||
      result.performance_metrics?.confidence ||
      result.performance_metrics?.confidence_score ||
      result.performance_metrics?.confidence_level ||
      result.metrics?.overall_confidence ||
      result.metrics?.confidence ||
      result.metrics?.confidence_score ||
      result.metrics?.confidence_level
      ),
    };
    
    if(typeof metrics.accuracy==='object') {metrics.accuracy=findMaxClassMetricValue(metrics.accuracy);}
    if(typeof metrics.precision==='object') { metrics.precision=findMaxClassMetricValue(metrics.precision);}
    if(typeof metrics.recall==='object') { metrics.recall=findMaxClassMetricValue(metrics.recall);}
    if(typeof metrics.f1Score==='object') { metrics.f1Score=findMaxClassMetricValue(metrics.f1Score);}
    

    // // Calculate trend based on accuracy (or any other metric)
    // let trendValue = '0%';
    // if (newHistory.length > 1) {
    //   const latestAccuracy = metrics.accuracy;
    //   const previousAccuracy = newHistory[newHistory.length - 2].result.performance_metrics?.accuracy || 0;
  
    //   if (previousAccuracy !== 0) {
    //     const trend = ((latestAccuracy - previousAccuracy) / previousAccuracy) * 100;
    //     trendValue = `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
    //   }
    // }
  console.log('DP Metrics:', metrics);
    // Add the trend value to the metrics
    //metrics.trendValue = trendValue;
    const newHistory = [...state.history.diseasePrediction, { symptoms, result, metrics }].slice(-10);

    return {
      diseasePredictionResult: result,
      diseasePredictionMetrics: metrics,
      history: {
        ...state.history,
        diseasePrediction: newHistory,
      },
    };
  }),
  
  
  deserializeImageClassificationResult(apiResponse: any): ImageClassificationResult {
    return {
      success: apiResponse.success,
      model: apiResponse.model,
      processing_time: apiResponse.processing_time,
      results: apiResponse.predictions.map((prediction: any): ImagePrediction => ({
        label: prediction.label,
        confidence: prediction.confidence,
      })),
    };
  },
  
  setImageClassificationResult: (imageName, result) => set((state) => ({
    imageClassificationResult: result,
    history: {
      ...state.history,
      imageClassification: [...state.history.imageClassification, { imageName, result }].slice(-10),
    },
  })),
  
  updateMetrics: (modelType, metrics) => set((state) => ({
    [`${modelType}Metrics`]: metrics,
  })),
  
  clearResults: () => set({
    textAnalysisResult: null,
    questionAnsweringResult: null,
    diseasePredictionResult: null,
    imageClassificationResult: null,
  }),
}));

// Utility function to parse approximate metric strings
export const parseMetric = (metric: string | number| undefined): number => {
  console.log('Parsing metric:', metric);
  if (!metric) return 0;
  if (typeof metric === 'number') {
    return metric; // Return the number as is
  } 
  if(typeof metric === 'object') {
    return findMaxClassMetricValue(metric);
  }
  if(typeof metric === 'string') {
    const match = metric.match(/\d+(\.\d+)?/); // Extract numeric value from the string
    return match ? parseFloat(match[0]) / 100 : processString(metric);
  }
  return 0; // Return 0 if the metric is not a number or string
 // Convert to a decimal (e.g., 95 -> 0.95)
};
// Function to find the maximum value for a class-specific metric
const findMaxClassMetricValue = (metric: any) => {
  if (typeof metric === 'object' && metric !== null) {
    return Math.max(...Object.values(metric).filter((value) => typeof value === 'number'));
  }
  return 0; // Return null if the metric is not an object
};
function processString(metric: string): number {
  if(typeof metric === 'string')
  {
    const loww= metric.toLowerCase();
    if (loww.includes('low')) {
      return 0.1; // Low confidence
    }
    if (loww.includes('high')) {
      return 0.9; // High confidence
    }
    if (loww.includes('medium')) {
      return 0.5; // Medium confidence
    }
    if (loww.includes('moderate')) {
      return 0.5; // Medium confidence
    }
    if (loww.includes('very low')) {
      return 0.05; // Very low confidence
    }
    if (loww.includes('very high')) {
      return 0.95; // Very high confidence
    }
    if (loww.includes('unknown')) {
      return 0.5; // Unknown confidence
    }
    if (loww.includes('normal')) {
      return 0.5; // Normal confidence
    }
    if (loww.includes('abnormal')) {  
      return 0.5; // Abnormal confidence
    }
    if (loww.includes('positive')) {  
      return 0.8; // Positive confidence
    }
    if (loww.includes('negative')) {
      return 0.2; // Negative confidence
    }
    if (loww.includes('neutral')) { 
      return 0.5; // Neutral confidence
    } 
  }
  return 0;
}
// Utility function to extract confidence score
const getConfidenceScore = (result: QuestionAnsweringResult): number | null => {
  
  if (result.confidence !== undefined) {
    return parseMetric(result.confidence);
  }
  if (result.confidence_level !== undefined) {
    return parseMetric(result.confidence_level);
  }
  if (result.confidence_score !== undefined) {
    return parseMetric(result.confidence_score);
  }
  if (result.performance_metrics?.confidence !== undefined) {
    return parseMetric(result.performance_metrics.confidence);
  }
  if (result.performance_metrics?.confidence_score !== undefined) {
    return parseMetric(result.performance_metrics.confidence_score);
  }
  if (result.performance_metrics?.confidence_level !== undefined) {
    return parseMetric(result.performance_metrics.confidence_level);
  }
  return null; // Return null if no confidence score is found
};