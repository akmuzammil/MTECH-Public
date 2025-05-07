import React, { useState, useCallback, useEffect } from 'react';
import { Upload, AlertCircle, FileText, CheckCircle, XCircle, BotMessageSquare } from 'lucide-react';
import { Card, CardGrid } from '../components/Card';
import TextareaWithAnalysis from '../components/TextareaWithAnalysis';
import { createFineTuningJob, getFineTuningJobStatus,listFineTuningJobs,testFineTunedModel } from '../services/aiService';

interface FineTuningStatus {
  status: 'idle' | 'preparing' | 'uploading' | 'training' | 'completed' | 'error';
  message?: string;
  error?: string;
  jobId?: string;
  fineTunedModel?: string;
  progress?: number;
}

const FineTuning: React.FC = () => {
  useEffect(() => {
    fetchJobs();
  }, []);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [trainingData, setTrainingData] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FineTuningStatus>({
    status: 'idle'
  });
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [jobList, setJobList] = useState<any[]>([]);

  const validateData = (data: string): boolean => {
    try {
      const lines = data.trim().split('\n');
      for (const line of lines) {
        const entry = JSON.parse(line);
        if (!entry.messages || !Array.isArray(entry.messages)) {
          throw new Error('Each line must contain a messages array');
        }
        for (const msg of entry.messages) {
          if (!msg.role || !msg.content || typeof msg.content !== 'string') {
            throw new Error('Each message must have a role and content');
          }
        }
      }
      return true;
    } catch (error) {
      setStatus({
        status: 'error',
        error: 'Invalid data format. Please ensure each line is a valid JSON object with messages array.'
      });
      return false;
    }
  };

  const handleFineTune = async () => {
    if (!trainingData.trim() || !validateData(trainingData)) return;

    try {
      setLoading(true);
      setStatus({ status: 'preparing' });

      const result = await createFineTuningJob(trainingData);
      
      setStatus({
        status: 'training',
        jobId: result.jobId,
        message: 'Fine-tuning job started successfully'
      });

      // Start polling for job status
      const intervalId = setInterval(async () => {
        try {
          const jobStatus = await getFineTuningJobStatus(result.jobId);
          
          if (jobStatus.status === 'succeeded') {
            clearInterval(intervalId);
            setStatus({
              status: 'completed',
              message: 'Fine-tuning completed successfully',
              jobId: result.jobId,
              fineTunedModel: jobStatus.fineTunedModel || undefined,
            });
            // Refresh the job list and set the selected model
            const updatedJobs = await listFineTuningJobs();
            setJobList(updatedJobs);

            // Automatically select the newly trained model
            if (jobStatus.fineTunedModel) {
              setSelectedModel(jobStatus.fineTunedModel);
            }
            console.log('Curretn Status:', status);
          } else if (jobStatus.status === 'failed') {
            clearInterval(intervalId);
            setStatus({
              status: 'error',
              error: jobStatus.error || 'Fine-tuning failed',
              jobId: result.jobId
            });
          } else {
            setStatus({
              status: 'training',
              message: `Fine-tuning in progress: ${jobStatus.progress}%`,
              progress: jobStatus.progress,
              jobId: result.jobId
            });
          }
        } catch (error) {
          console.error('Error checking job status:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('Fine-tuning error:', error);
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'preparing':
      case 'uploading':
      case 'training':
        return <Upload className="h-6 w-6 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6" />;
      case 'error':
        return <XCircle className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'preparing':
      case 'uploading':
      case 'training':
        return 'bg-warning/20 text-warning';
      case 'completed':
        return 'bg-success/20 text-success';
      case 'error':
        return 'bg-error/20 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const fetchJobs = async () => {
    try {
      const jobs = await listFineTuningJobs();
      setJobList(jobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };
  
  const handleTestModel = async () => {
    if (!testInput.trim() || !selectedModel) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testFineTunedModel(selectedModel, testInput);
      setTestResult(result);
    } catch (err) {
      setTestResult('Error fetching model response.');
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Model Fine-Tuning</h1>
        <p className="text-muted-foreground">
          Fine-tune the AI models with your custom healthcare data to improve performance
          for your specific use cases.
        </p>
      </div>
      <button onClick={fetchJobs}
        className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90">
        Refresh Jobs
      </button>

      <Card title="All Fine-Tuning Jobs" className="space-y-4">
        {jobList.length === 0 ? (
          <p className="text-muted-foreground text-sm">No fine-tuning jobs found.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {jobList.map((job) => (
              <div key={job.id} className="border p-3 rounded-md bg-muted/30">
                <p><strong>Job ID:</strong> {job.id}</p>
                <p><strong>Status:</strong> {job.status}</p>
                <p><strong>Model:</strong> {job.fine_tuned_model || 'Pending'}</p>
                <p><strong>Created:</strong> {new Date(job.created_at * 1000).toLocaleString()}</p>
                {job.fine_tuned_model && (
                  <button
                    onClick={() => setSelectedModel(job.fine_tuned_model)}
                    className={`mt-2 px-3 py-1 text-sm rounded ${
                      selectedModel === job.fine_tuned_model
                        ? 'bg-success text-white'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {selectedModel === job.fine_tuned_model ? 'Selected' : 'Select for Testing'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      {selectedModel && (
        <Card title="Test Your Selected Fine-Tuned Model" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>Selected Model:</strong> {selectedModel}
          </p>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type your prompt here..."
            className="w-full p-3 border rounded-md text-sm min-h-[120px]"
          />
          <button
            onClick={handleTestModel}
            disabled={testing || !testInput.trim()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Model'}
          </button>

          {testResult && (
            <div className="bg-muted/50 p-4 rounded text-sm flex gap-2 items-start">
              <BotMessageSquare className="w-5 h-5 mt-1 text-primary" />
              <div>{testResult}</div>
            </div>
          )}
        </Card>
      )}
      <CardGrid columns={2}>
        <Card title="Training Data" className="space-y-4">
          <TextareaWithAnalysis
            value={trainingData}
            onChange={setTrainingData}
            onAnalyze={handleFineTune}
            placeholder={`Paste your training data in JSONL format, e.g.:
{"messages": [{"role": "system", "content": "You are a medical assistant"}, {"role": "user", "content": "What are the symptoms of diabetes?"}, {"role": "assistant", "content": "Common symptoms include..."}]}
{"messages": [{"role": "system", "content": "You are a medical assistant"}, {"role": "user", "content": "How is blood pressure measured?"}, {"role": "assistant", "content": "Blood pressure is measured using..."}]}`}
            loading={loading}
            label="Training Data (JSONL format)"
          />
          
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-1" />
            <div>
              <p className="font-medium mb-1">Data Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Each line must be a valid JSON object</li>
                <li>Each object must have a "messages" array</li>
                <li>Messages must include "role" and "content"</li>
                <li>Supported roles: "system", "user", "assistant"</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Training Status" className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className={`p-3 rounded-full ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            
            <div>
              <p className="font-medium capitalize">
                {status.status === 'idle' ? 'Ready to Start' : status.status}
              </p>
              <p className="text-sm text-muted-foreground">
                {status.message || 
                 (status.status === 'idle' ? 'Upload your dataset to begin fine-tuning' :
                  status.error || 'Processing...')}
              </p>
            </div>
          </div>

          {status.status === 'training' && status.progress !== undefined && (
            <div className="space-y-2 p-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{status.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* {status.status === 'completed' && status.fineTunedModel && (
            <Card title="Test Your Fine-Tuned Model" className="space-y-4">
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type your prompt here..."
                className="w-full p-3 border rounded-md text-sm min-h-[120px]"
              />
              <button
                onClick={handleTestModel}
                disabled={testing || !testInput.trim()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Model'}
              </button>

              {testResult && (
                <div className="bg-muted/50 p-4 rounded text-sm flex gap-2 items-start">
                  <BotMessageSquare className="w-5 h-5 mt-1 text-primary" />
                  <div>{testResult}</div>
                </div>
              )}
            </Card>
          )} */}

          {status.status === 'error' && (
            <div className="p-4 rounded-lg bg-error/10 text-error text-sm">
              <p className="font-medium">Error during fine-tuning:</p>
              <p className="mt-1">{status.error}</p>
              {status.jobId && (
                <p className="mt-2 font-mono text-xs">Job ID: {status.jobId}</p>
              )}
            </div>
          )}
        </Card>
      </CardGrid>
    </div>
  );
};

export default FineTuning;