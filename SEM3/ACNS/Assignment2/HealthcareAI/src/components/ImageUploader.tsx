import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, X, Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  acceptedTypes?: string[];
  maxSize?: number;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onImageRemove,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  maxSize = 5242880, // 5MB
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (!acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload ${acceptedTypes.join(', ')}`);
      return;
    }
    
    if (file.size > maxSize) {
      setError(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    onImageUpload(file);
  }, [acceptedTypes, maxSize, onImageUpload]);

  const clearImage = useCallback(() => {
    setPreview(null);
    setError(null);
    if (onImageRemove) {
      onImageRemove();
    }
  }, [onImageRemove]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes,
    },
    maxSize,
    multiple: false,
  });

  return (
    <div className={className}>
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center
            transition-colors cursor-pointer h-60
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-background'}
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            )}
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop image here' : 'Drag & drop an image here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: JPEG, PNG, GIF
              <br />
              Maximum size: {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border h-60">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-background border border-border rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;