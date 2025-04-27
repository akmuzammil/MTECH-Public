import React, { useState, useEffect } from 'react';
import { Stats } from '../App';

interface StatsPanelProps {
  stats: Stats;
  darkMode: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, darkMode }) => {
  const [counters, setCounters] = useState({
    produced: 0,
    group1: 0,
    group2: 0,
    group3: 0
  });
  
  // Use animated counters for a better visual effect
  useEffect(() => {
    const targetCounters = {
      produced: stats.produced_count,
      group1: stats.consumed_count.group1,
      group2: stats.consumed_count.group2,
      group3: stats.consumed_count.group3
    };
    
    const updateCounters = () => {
      let needsUpdate = false;
      
      setCounters(prev => {
        const newCounters = { ...prev };
        
        Object.keys(targetCounters).forEach(key => {
          const typedKey = key as keyof typeof targetCounters;
          if (newCounters[typedKey] !== targetCounters[typedKey]) {
            // Smooth counter animation
            const diff = targetCounters[typedKey] - newCounters[typedKey];
            const increment = Math.ceil(diff / 10);
            
            if (diff > 0) {
              newCounters[typedKey] += increment;
              if (newCounters[typedKey] > targetCounters[typedKey]) {
                newCounters[typedKey] = targetCounters[typedKey];
              }
              needsUpdate = true;
            }
          }
        });
        
        return newCounters;
      });
      
      if (needsUpdate) {
        requestAnimationFrame(updateCounters);
      }
    };
    
    updateCounters();
  }, [stats]);

  // Calculate the percentage of messages consumed by each group
  const calculatePercentage = (count: number) => {
    if (stats.produced_count === 0) return 0;
    return Math.round((count / stats.produced_count) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Total Messages */}
      <div>
        <h3 className="text-sm font-medium mb-1">Total Messages Produced</h3>
        <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
          {counters.produced.toLocaleString()}
        </div>
      </div>
      
      {/* Average Latency */}
      <div>
        <h3 className="text-sm font-medium mb-1">Average Processing Latency</h3>
        <div className={`text-3xl font-bold ${
          stats.avg_latency_ms < 500 
            ? darkMode ? 'text-green-400' : 'text-green-600'
            : stats.avg_latency_ms < 1000
            ? darkMode ? 'text-amber-400' : 'text-amber-600'
            : darkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          {stats.avg_latency_ms.toFixed(2)} ms
        </div>
      </div>
      
      {/* Consumer Group Statistics */}
      <div className="pt-2">
        <h3 className="text-sm font-medium mb-2">Consumer Groups</h3>
        
        <div className="space-y-3">
          {/* Group 1 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Group 1 (Shared)</span>
              <span>{calculatePercentage(stats.consumed_count.group1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${calculatePercentage(stats.consumed_count.group1)}%` }}
              ></div>
            </div>
            <div className="text-sm mt-1">{counters.group1.toLocaleString()} messages</div>
          </div>
          
          {/* Group 2 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Group 2 (Exclusive)</span>
              <span>{calculatePercentage(stats.consumed_count.group2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${calculatePercentage(stats.consumed_count.group2)}%` }}
              ></div>
            </div>
            <div className="text-sm mt-1">{counters.group2.toLocaleString()} messages</div>
          </div>
          
          {/* Group 3 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Group 3 (Filtered)</span>
              <span>{calculatePercentage(stats.consumed_count.group3)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${calculatePercentage(stats.consumed_count.group3)}%` }}
              ></div>
            </div>
            <div className="text-sm mt-1">{counters.group3.toLocaleString()} messages</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;