import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  to,
  className,
}) => {
  return (
    <Link 
      to={to}
      className={cn(
        "card p-6 group hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-primary/20",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
        <div className="flex items-center text-primary font-medium">
          <span>Explore</span>
          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;