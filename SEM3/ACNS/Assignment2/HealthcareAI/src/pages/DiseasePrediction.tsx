import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, Brain } from 'lucide-react';
import { Card, CardGrid } from '../components/Card';
import TextareaWithAnalysis from '../components/TextareaWithAnalysis';
import { useAIStore } from '../store';
import { mockDiseasePrediction } from '../services/mockApiService';
import { normalizeConfidence, predictDisease } from '../services/aiService';
const DiseasePrediction: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const { 
    diseasePredictionResult,
    loadingDiseasePrediction,
    setDiseasePredictionLoading,
    setDiseasePredictionResult,
    clearResults
  } = useAIStore();

  useEffect(() => {
    clearResults();
  }, [clearResults]);

  const handlePredict = async () => {
    if (!symptoms.trim()) return;
    
    setDiseasePredictionLoading(true);
    try {
      const result = await predictDisease(symptoms);
      console.log('Disease Prediction Result:', result);
      setDiseasePredictionResult(symptoms, result);
    } catch (error) {
      console.error('Error predicting disease:', error);
    } finally {
      setDiseasePredictionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Disease Prediction</h1>
        <p className="text-muted-foreground">
          Describe the symptoms in detail to receive AI-powered disease predictions and risk assessments.
        </p>
      </div>

      <CardGrid columns={2}>
        <div className="space-y-6">
          <Card title="Symptom Description">
            <TextareaWithAnalysis
              value={symptoms}
              onChange={setSymptoms}
              onAnalyze={handlePredict}
              placeholder="Describe the symptoms in detail..."
              loading={loadingDiseasePrediction}
              label="Patient Symptoms"
            />
            
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground border-t">
              <AlertCircle className="h-4 w-4" />
              <p>
                For accurate predictions, please provide detailed symptoms including duration,
                severity, and any relevant medical history.
              </p>
            </div>
          </Card>

          <Card className="bg-muted/20 border-primary/20">
            <div className="p-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-2">
                <h3 className="font-medium">How it works</h3>
                <p className="text-sm text-muted-foreground">
                  Health AI assistant uses openai model and analyzes the symptoms described and compares them against
                  a vast database of medical knowledge to predict potential conditions.
                  Results are provided with confidence scores to assist in clinical decision-making.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {diseasePredictionResult && (
          <Card title="Prediction Results">
            <div className="p-4 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  Prediction Confidence: {normalizeConfidence(diseasePredictionResult.overall_confidence).toFixed(1)}%
                </span>
              </div>

              <div className="space-y-6">
                {diseasePredictionResult.predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-card transition-colors hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{prediction.name}</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {normalizeConfidence(prediction.probability).toFixed(1)}%
                      </span>
                    </div>
                    
                    {prediction.description && (
                      <p className="text-sm text-muted-foreground">
                        {prediction.description}
                      </p>
                    )}
                    
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${normalizeConfidence(prediction.probability)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground border-t pt-4 mt-6">
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  These predictions are meant to assist, not replace, professional medical diagnosis.
                  Always consult with healthcare professionals for proper medical advice.
                </p>
              </div>
            </div>
          </Card>
        )}
      </CardGrid>

      {loadingDiseasePrediction && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-primary">
            <Activity className="h-5 w-5 animate-pulse" />
            <span>Analyzing symptoms...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseasePrediction;