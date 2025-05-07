import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface TextareaWithAnalysisProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  placeholder?: string;
  className?: string;
  loading?: boolean;
  label?: string;
}

const TextareaWithAnalysis: React.FC<TextareaWithAnalysisProps> = ({
  value,
  onChange,
  onAnalyze,
  placeholder = 'Enter text to analyze...',
  className,
  loading = false,
  label,
}) => {
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCharCount(newValue.length);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="textarea w-full h-40 resize-none"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {charCount} characters
          </span>
          <button
            onClick={onAnalyze}
            disabled={loading || value.trim().length === 0}
            className="btn btn-primary ml-auto"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextareaWithAnalysis;