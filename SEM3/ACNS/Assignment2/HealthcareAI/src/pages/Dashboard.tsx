import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  Activity, 
  ImageIcon, 
  BarChart3, 
  Cog 
} from 'lucide-react';
import { CardGrid } from '../components/Card';
import FeatureCard from '../components/FeatureCard';
import { useAIStore } from '../store';

const Dashboard: React.FC = () => {
  const { 
    textAnalysisMetrics,
    questionAnsweringMetrics,
    diseasePredictionMetrics,
    imageClassificationMetrics,
  } = useAIStore();

  const features = [
    {
      title: 'Medical Text Analysis',
      description: 'Extract key medical entities, summarize, and analyze clinical notes and medical texts.',
      icon: <FileText className="h-8 w-8" />,
      to: '/text-analysis',
      metrics: textAnalysisMetrics
    },
    {
      title: 'Medical Q&A System',
      description: 'Get answers to medical questions using our specialized healthcare knowledge base.',
      icon: <HelpCircle className="h-8 w-8" />,
      to: '/question-answering',
      metrics: questionAnsweringMetrics
    },
    {
      title: 'Symptom-Based Disease Prediction',
      description: 'Predict potential conditions based on symptoms described in natural language.',
      icon: <Activity className="h-8 w-8" />,
      to: '/disease-prediction',
      metrics: diseasePredictionMetrics
    },
    {
      title: 'Medical Image Classification',
      description: 'Analyze and classify medical images to detect potential abnormalities.',
      icon: <ImageIcon className="h-8 w-8" />,
      to: '/image-classification',
      metrics: imageClassificationMetrics
    },
    {
      title: 'Performance Metrics',
      description: 'Track and analyze AI model performance with key metrics and visualizations.',
      icon: <BarChart3 className="h-8 w-8" />,
      to: '/metrics',
    },
    {
      title: 'Model Fine-Tuning',
      description: 'Fine-tune our AI models on your specific healthcare data for better performance.',
      icon: <Cog className="h-8 w-8" />,
      to: '/fine-tuning',
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">Healthcare AI Assistant</h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive healthcare AI solution combining Natural Language Processing and Computer Vision 
          to assist healthcare professionals with medical analysis and decision support.
        </p>
      </div>
      
      <CardGrid columns={3}>
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            to={feature.to}
          />
        ))}
      </CardGrid>
    </div>
  );
};

export default Dashboard;