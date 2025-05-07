import React from 'react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void; 
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  onClick,
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    
    if (trend === 'down') return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 7L17 17M17 17V7M17 17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    
    return null;
  };

  return (
    <div className={cn("card p-6", className)} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
            {trend && trendValue && (
              <p className={cn("ml-2 flex items-center text-sm", getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">{trendValue}</span>
              </p>
            )}
          </div>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
    </div>
  );
};

export default MetricCard;