import React, { useEffect, useState } from 'react';
import { QuestionAnsweringResult } from '../types';
import { mockQuestionAnswering } from '../services/mockApiService';

import { Brain } from 'lucide-react';
import { answerQuestion, normalizeConfidence } from '../services/aiService';
import { useAIStore,parseMetric } from '../store';


const QuestionAnswering = () => {
  const [question, setQuestion] = useState('');
  const { 
      questionAnsweringResult, 
      loadingQuestionAnswering,
      setQuestionAnsweringLoading,
      setQuestionAnsweringResult,
      clearResults
    } = useAIStore();
  
  useEffect(() => {
    clearResults();
  }, [clearResults]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQuestionAnsweringLoading(true);
    try {
      const result = await answerQuestion(question);
      console.log('Question Answering Result:', result);
     // Extract confidence score using the utility function
     setQuestionAnsweringResult(question, result);
     // Update the result with the extracted confidence score
     //setResult({ ...response, confidence });
    } catch (error) {
      console.error('Error getting answer:', error);
    } finally {
      setQuestionAnsweringLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          Medical Question Answering
        </h1>
        <p className="mt-2 text-gray-600">
          Ask any medical question and get evidence-based answers from our AI system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your medical question here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loadingQuestionAnswering || !question.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingQuestionAnswering ? 'Processing...' : 'Ask'}
          </button>
        </div>
      </form>
      {questionAnsweringResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Check if the response contains a definition (structured response) */}
          {questionAnsweringResult.definition ? (
            <>
              <div>
                <span className="font-medium">Confidence Score:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {`${normalizeConfidence(parseMetric(questionAnsweringResult.confidence || questionAnsweringResult.confidence_score || 0)).toFixed(1)}%`
                      }
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Definition</h3>
                <p className="text-gray-700">{questionAnsweringResult.definition}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Causes</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {questionAnsweringResult.causes?.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Symptoms</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {questionAnsweringResult.symptoms?.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Types</h3>
                
                  {questionAnsweringResult.types?.map((typeObj, index) => (
                    <li key={index}>
                      {Object.entries(typeObj).map(([type, description]) => (
                        <div key={type} className="mb-2">
                          <strong>{type}:</strong> {description}
                        </div>
                      ))}
                    </li>
                  ))}
                
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Diagnosis</h3>
                <p className="text-gray-700">{questionAnsweringResult.diagnosis}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Treatment</h3>
                <p className="text-gray-700">{questionAnsweringResult.treatment}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sources</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {questionAnsweringResult.sources?.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>

            </>
          ) : (
            /* Render the standard answer, confidence, and sources */
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Answer</h3>
                <p className="text-gray-700">
                  {questionAnsweringResult.answer?.trim()
                    ? questionAnsweringResult.answer
                    : "No answer available."}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Confidence Score:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {`${normalizeConfidence(parseMetric(questionAnsweringResult.confidence || questionAnsweringResult.confidence_score || 0)).toFixed(1)}%`
                      }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Sources:</span>
                  <span>
                    {questionAnsweringResult.sources?.length
                      ? questionAnsweringResult.sources.join(", ")
                      : "No sources available"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* {questionAnsweringResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Answer</h3>
            <p className="text-gray-700">{questionAnsweringResult.answer}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium">Confidence Score:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {normalizeConfidence(questionAnsweringResult.confidence).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Sources:</span>
              <span>{questionAnsweringResult.sources?.join(', ') || 'No sources available'}</span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default QuestionAnswering;