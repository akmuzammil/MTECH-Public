import React, { useEffect, useState } from 'react';
import { FileSearch, ListChecks, MessageSquare, Tag } from 'lucide-react';
import { Card, CardGrid } from '../components/Card';
import TextareaWithAnalysis from '../components/TextareaWithAnalysis';
import { useAIStore } from '../store';
import { mockTextAnalysis } from '../services/mockApiService';
import { analyzeText } from '../services/aiService';

const TextAnalysis: React.FC = () => {
  const [text, setText] = useState<string>('');
  const { 
    textAnalysisResult, 
    loadingTextAnalysis,
    setTextAnalysisLoading,
    setTextAnalysisResult,
    clearResults
  } = useAIStore();
  
  useEffect(() => {
    clearResults();
  }, [clearResults]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setTextAnalysisLoading(true);
    try {
      const result = await analyzeText(text);
      console.log('Text Analysis Result:', result);
      setTextAnalysisResult(text, result);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setTextAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Medical Text Analysis</h1>
        <p className="text-muted-foreground">
          Extract entities, analyze sentiment, and summarize clinical notes and medical texts.
        </p>
      </div>

      <Card>
        <TextareaWithAnalysis
          value={text}
          onChange={setText}
          onAnalyze={handleAnalyze}
          loading={loadingTextAnalysis}
          placeholder="Enter medical text to analyze (e.g., clinical notes, symptoms description, patient history)..."
          label="Clinical Text"
        />
      </Card>

      {textAnalysisResult && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Summary */}
          <Card title="Summary" className="bg-muted bg-opacity-20">
            <p className="text-foreground">{textAnalysisResult.summary}</p>
          </Card>

          {/* Entities */}
          <Card title="Medical Entities">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {textAnalysisResult.entities.map((entity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start p-3 rounded-md border"
                  >
                    <div className={`
                      p-2 rounded-md mr-3
                      ${entity.type === 'Symptom' ? 'bg-warning/10 text-warning' : 
                        entity.type === 'Condition' ? 'bg-error/10 text-error' : 
                        entity.type === 'Medication' ? 'bg-success/10 text-success' : 
                        'bg-primary/10 text-primary'}
                    `}>
                      {entity.type === 'Symptom' ? <ListChecks className="h-5 w-5" /> : 
                       entity.type === 'Condition' ? <MessageSquare className="h-5 w-5" /> : 
                       entity.type === 'Medication' ? <FileSearch className="h-5 w-5" /> : 
                       <Tag className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{entity.text}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span className="mr-2">{entity.type}</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded-sm">
                          {(entity.score * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {textAnalysisResult.entities.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No medical entities detected in the provided text.
                </p>
              )}
            </div>
          </Card>
          
          {/* Keywords and Sentiment */}
          <CardGrid columns={2}>
            <Card title="Keywords">
              <div className="flex flex-wrap gap-2">
                {textAnalysisResult.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              
              {textAnalysisResult.keywords.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No relevant keywords detected.
                </p>
              )}
            </Card>
            
            <Card title="Document Sentiment">
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center mb-4
                  ${textAnalysisResult.sentiment.label === 'positive' ? 'bg-success/20 text-success' : 
                    textAnalysisResult.sentiment.label === 'negative' ? 'bg-error/20 text-error' : 
                    'bg-primary/20 text-primary'}
                `}>
                  {textAnalysisResult.sentiment.label === 'positive' ? (
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : textAnalysisResult.sentiment.label === 'negative' ? (
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold capitalize">
                  {textAnalysisResult.sentiment.label}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Confidence: {(textAnalysisResult.sentiment.score * 100).toFixed(0)}%
                </p>
              </div>
            </Card>
          </CardGrid>
        </div>
      )}
    </div>
  );
};

export default TextAnalysis;