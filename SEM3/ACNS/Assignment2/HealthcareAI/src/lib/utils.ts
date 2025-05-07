import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function calculateAccuracy(predictions: number[], actual: number[]): number {
  if (predictions.length !== actual.length || predictions.length === 0) {
    return 0;
  }

  const correct = predictions.filter((pred, index) => pred === actual[index]).length;
  return (correct / predictions.length) * 100;
}

export function calculatePrecision(tp: number, fp: number): number {
  return tp + fp === 0 ? 0 : tp / (tp + fp);
}

export function calculateRecall(tp: number, fn: number): number {
  return tp + fn === 0 ? 0 : tp / (tp + fn);
}

export function calculateF1Score(precision: number, recall: number): number {
  return precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
}