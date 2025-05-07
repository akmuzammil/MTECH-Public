import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, className, children }) => {
  return (
    <div className={cn("card p-6", className)}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
};

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  className,
  columns = 3
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(`grid gap-6 ${gridCols[columns]}`, className)}>
      {children}
    </div>
  );
};

export default Card;