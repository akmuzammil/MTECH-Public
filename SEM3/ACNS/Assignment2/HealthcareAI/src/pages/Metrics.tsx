import React,{useEffect, useState} from 'react';
import { BarChart3, Brain, FileText, ImageIcon } from 'lucide-react';
import { Card, CardGrid } from '../components/Card';
import MetricCard from '../components/MetricCard';
import { useAIStore } from '../store';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { normalizeConfidence } from '../services/aiService';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Metrics: React.FC = () => {
  // const {
  //   textAnalysisMetrics,
  //   questionAnsweringMetrics,
  //   diseasePredictionMetrics,
  //   imageClassificationMetrics,
  // } = useAIStore();
  const { history } = useAIStore();

  // State to track the selected model
  const [selectedModel, setSelectedModel] = useState<string>('Text Analysis');
 // Extract the most recent metrics for each model from their respective histories
 const textAnalysisMetrics = history.textAnalysis[history.textAnalysis.length - 1]?.metrics || {};
 const questionAnsweringMetrics = history.questionAnswering[history.questionAnswering.length - 1]?.metrics || {};
 const diseasePredictionMetrics = history.diseasePrediction[history.diseasePrediction.length - 1]?.metrics || {};
 const imageClassificationMetrics = history.imageClassification[history.imageClassification.length - 1]?.result.results || {};

  // Get the history of the selected model
  const selectedHistory =
    selectedModel === 'Text Analysis'
      ? history.textAnalysis
      : selectedModel === 'Q&A System'
      ? history.questionAnswering
      : selectedModel === 'Disease Prediction'
      ? history.diseasePrediction
      : history.imageClassification;

  // Extract the most recent metrics from the selected model's history
  const latestMetrics = selectedHistory[selectedHistory.length - 1]?.metrics || {};
  console.log('Latest Metrics:', latestMetrics);
  const calculateTrendValue = (history: any[]) => {
    if (history.length < 2) return '0%'; // Not enough data to calculate trend
  
    const latestAccuracy = history[history.length - 1]?.result.metrics?.accuracy || 0;
    const previousAccuracy = history[history.length - 2]?.result.metrics?.accuracy || 0;
  
    if (previousAccuracy === 0) return '0%'; // Avoid division by zero
  
    const trend = ((latestAccuracy - previousAccuracy) / previousAccuracy) * 100;
    return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
  };
  const calculateImageTrendValue = (history: any[]) => {
    if (history.length < 2) return '0%'; // Not enough data to calculate trend
  
    const latestAccuracy = history[history.length - 1]?.result.results?.confidence || 0;
    const previousAccuracy = history[history.length - 2]?.result.results?.confidence || 0;
  
    if (previousAccuracy === 0) return '0%'; // Avoid division by zero
  
    const trend = ((latestAccuracy - previousAccuracy) / previousAccuracy) * 100;
    return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
  };
  const textAnalysisTrendValue = calculateTrendValue(history.textAnalysis);
  const questionAnsweringTrendValue = calculateTrendValue(history.questionAnswering);
  const diseasePredictionTrendValue = calculateTrendValue(history.diseasePrediction);
  const imageClassificationTrendValue = calculateImageTrendValue(history.imageClassification);
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      datalabels: {
        display: true,
        color: '#000',
        anchor: 'end',
        align: 'top',
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const horizontalChartOptions = {
    responsive: true,
    indexAxis: 'y', // This makes the bar chart horizontal
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      datalabels: {
        display: true,
        color: '#000',
        anchor: 'end',
        align: 'right',
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
      },
    },
  };
  // const chartData = {
  //   labels: ['Text Analysis', 'Q&A', 'Disease Prediction', 'Image Classification'],
  //   datasets: [
  //     {
  //       label: 'Accuracy',
  //       data: [
  //         (textAnalysisMetrics?.accuracy || 0) * 100,
  //         (questionAnsweringMetrics?.accuracy || 0) * 100,
  //         (diseasePredictionMetrics?.accuracy || 0) * 100,
  //         (imageClassificationMetrics?.accuracy || 0) * 100,
  //       ],
  //       backgroundColor: 'rgba(14, 165, 233, 0.5)',
  //       borderColor: 'rgb(14, 165, 233)',
  //       borderWidth: 1,
  //     },
  //     {
  //       label: 'F1 Score',
  //       data: [
  //         (textAnalysisMetrics?.f1Score || 0) * 100,
  //         (questionAnsweringMetrics?.f1Score || 0) * 100,
  //         (diseasePredictionMetrics?.f1Score || 0) * 100,
  //         (imageClassificationMetrics?.f1Score || 0) * 100,
  //       ],
  //       backgroundColor: 'rgba(34, 197, 94, 0.5)',
  //       borderColor: 'rgb(34, 197, 94)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };
  const chartData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [
      {
        label: `${selectedModel} Metrics`,
        data: [
          (latestMetrics.accuracy || 0) * 100,
          (latestMetrics.precision || 0) * 100,
          (latestMetrics.recall || 0) * 100,
          (latestMetrics['F1 score'] || latestMetrics['F1_score']  || latestMetrics['f1 score'] || latestMetrics['f1_score']|| latestMetrics.f1Score || 0) * 100,
          
        ],
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
      },
    ],
  };
  const imageClassificationChartData = {
    labels: ['Confidence'],
    datasets: [
      {
        label: 'Image Classification Metrics',
        data: [(imageClassificationMetrics?.confidence || 0) * 100],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4">Model Performance Metrics</h1>
      <p className="text-muted-foreground">
        Click on a model to view its detailed performance metrics.
      </p>

      {/* Metric Cards */}
      <CardGrid columns={4}>
        <MetricCard
          title="Text Analysis"
          value={`${((textAnalysisMetrics?.accuracy ?? 0) * 100).toFixed(1)}%`}
          description="Entity recognition and sentiment analysis accuracy"
          icon={<FileText className="h-6 w-6" />}
          trend={textAnalysisTrendValue?.startsWith('+') ? 'up' : 'down'}
          trendValue={textAnalysisTrendValue || '0%'}
          onClick={() => setSelectedModel('Text Analysis')}
        />
        <MetricCard
          title="Q&A System"
          value={`${((questionAnsweringMetrics?.confidence ?? 0) * 100).toFixed(1)}%`}
          description="Question answering accuracy"
          icon={<Brain className="h-6 w-6" />}
          trend={questionAnsweringTrendValue?.startsWith('+') ? 'up' : 'down'}
          trendValue={questionAnsweringTrendValue || '0%'}
          onClick={() => {       console.log('Q&A System clicked');
            setSelectedModel('Q&A System');}}
        />
        <MetricCard
          title="Disease Prediction"
          value={`${((diseasePredictionMetrics?.confidence ?? 0) * 100).toFixed(1)}%`}
          description="Diagnostic prediction accuracy"
          icon={<BarChart3 className="h-6 w-6" />}
          trend={diseasePredictionTrendValue?.startsWith('+') ? 'up' : 'down'}
          trendValue={diseasePredictionTrendValue || '0%'}
          onClick={() =>{       console.log('Disease Prediction clicked');
            setSelectedModel('Disease Prediction');}}
        />
        <MetricCard
          title="Image Classification"
          value={`${((imageClassificationMetrics?.confidence || 0) * 100).toFixed(1)}%`}
          description="Medical image classification accuracy"
          icon={<ImageIcon className="h-6 w-6" />}
          trend={imageClassificationTrendValue?.startsWith('+') ? 'up' : 'down'}
          trendValue={imageClassificationTrendValue || '0%'}
          onClick={() => setSelectedModel('Image Classification')}
        />
      </CardGrid>

      {/* Chart for Selected Model */}
      <Card title={`${selectedModel} Performance Overview`}>
        <div className="h-[400px] p-4">
          {selectedModel === 'Image Classification' ? (
            <Bar options={chartOptions} data={imageClassificationChartData} />
          ) : (
            <Bar options={chartOptions} data={chartData} />
          )}
        </div>
      </Card>
    </div>
  );
};
//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold mb-4">Model Performance Metrics</h1>
//         <p className="text-muted-foreground">
//           Track and analyze the performance of our AI models across different healthcare tasks.
//         </p>
//       </div>

//       <CardGrid columns={4}>
//         <MetricCard
//           title="Text Analysis"
//           value={`${((textAnalysisMetrics?.accuracy ?? 0) * 100).toFixed(1)}%`}
//           description="Entity recognition and sentiment analysis accuracy"
//           icon={<FileText className="h-6 w-6" />}
//           trend={textAnalysisMetrics?.trendValue.startsWith('+') ? 'up' : 'down'}
//           trendValue={textAnalysisMetrics?.trendValue || '0%'}
//         />
//         <MetricCard
//           title="Q&A System"
//           value={`${questionAnsweringMetrics?.accuracy.toFixed(1)}%`}
//           description="Question answering accuracy"
//           icon={<Brain className="h-6 w-6" />}
//           trend="up"
//           trendValue="+1.8%"
//         />
//         <MetricCard
//           title="Disease Prediction"
//           value={`${diseasePredictionMetrics?.accuracy.toFixed(1)}%`}
//           description="Diagnostic prediction accuracy"
//           icon={<BarChart3 className="h-6 w-6" />}
//           trend={diseasePredictionMetrics?.trendValue.startsWith('+') ? 'up' : 'down'}
//           trendValue={diseasePredictionMetrics?.trendValue || '0%'}
//         />
//         <MetricCard
//           title="Image Classification"
//           value={`${imageClassificationMetrics?.accuracy.toFixed(1)}%`}
//           description="Medical image classification accuracy"
//           icon={<ImageIcon className="h-6 w-6" />}
//           trend="up"
//           trendValue="+3.1%"
//         />
//       </CardGrid>

//       <Card title="Performance Overview">
//         <div className="h-[400px] p-4">
//           <Bar options={chartOptions} data={chartData} />
//         </div>
//       </Card>

//       <CardGrid columns={2}>
//         <Card title="Model Response Times">
//           <div className="space-y-4 p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium">Text Analysis</span>
//               <span className="text-sm text-muted-foreground">
//                 {textAnalysisMetrics?.latency}ms
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium">Q&A System</span>
//               <span className="text-sm text-muted-foreground">
//                 {questionAnsweringMetrics?.latency}ms
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium">Disease Prediction</span>
//               <span className="text-sm text-muted-foreground">
//                 {diseasePredictionMetrics?.latency}ms
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium">Image Classification</span>
//               <span className="text-sm text-muted-foreground">
//                 {imageClassificationMetrics?.latency}ms
//               </span>
//             </div>
//           </div>
//         </Card>

//         <Card title="Model Precision & Recall">
//           <div className="space-y-4 p-4">
//             {[
//               { name: 'Text Analysis', metrics: textAnalysisMetrics },
//               { name: 'Q&A System', metrics: questionAnsweringMetrics },
//               { name: 'Disease Prediction', metrics: diseasePredictionMetrics },
//               { name: 'Image Classification', metrics: imageClassificationMetrics },
//             ].map((model) => (
//               <div key={model.name} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">{model.name}</span>
//                   <div className="flex gap-4">
//                     <span className="text-sm text-muted-foreground">
//                       P: {(model.metrics?.precision || 0).toFixed(2)}
//                     </span>
//                     <span className="text-sm text-muted-foreground">
//                       R: {(model.metrics?.recall || 0).toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="h-2 bg-muted rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-primary rounded-full"
//                     style={{
//                       width: `${((model.metrics?.precision || 0) * 100)}%`,
//                     }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </CardGrid>
//     </div>
//   );
// };

export default Metrics;