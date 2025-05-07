import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TextAnalysis from './pages/TextAnalysis';
import QuestionAnswering from './pages/QuestionAnswering';
import DiseasePrediction from './pages/DiseasePrediction';
import ImageClassification from './pages/ImageClassification';
import Metrics from './pages/Metrics';
import FineTuning from './pages/FineTuning';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="text-analysis" element={<TextAnalysis />} />
        <Route path="question-answering" element={<QuestionAnswering />} />
        <Route path="disease-prediction" element={<DiseasePrediction />} />
        <Route path="image-classification" element={<ImageClassification />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="fine-tuning" element={<FineTuning />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;