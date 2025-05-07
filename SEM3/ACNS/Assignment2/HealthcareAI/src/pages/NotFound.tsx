import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="space-y-6 max-w-md mx-auto px-4">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        
        <p className="text-muted-foreground text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 btn btn-primary"
        >
          <HomeIcon className="h-5 w-5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;