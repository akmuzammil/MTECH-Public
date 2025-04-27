import React, { useEffect, useRef } from 'react';

interface MessageFlowProps {
  producedCount: number;
  consumedCounts: {
    group1: number;
    group2: number;
    group3: number;
  };
  darkMode: boolean;
}

const MessageFlow: React.FC<MessageFlowProps> = ({ producedCount, consumedCounts, darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  // Track previous counts to detect new messages
  const prevCountsRef = useRef({
    produced: 0,
    group1: 0,
    group2: 0,
    group3: 0
  });
  
  // Animation constants
  const NUM_PARTICLES = 50;
  const PARTICLE_SIZE = 3;
  const PARTICLE_SPEED = 2;
  
  // Create a new particle
  const createParticle = (startX: number, startY: number, targetX: number, targetY: number, color: string) => {
    return {
      x: startX,
      y: startY,
      targetX,
      targetY,
      color,
      progress: 0,
      speed: PARTICLE_SPEED * (0.5 + Math.random() * 0.5), // Some variation in speed
      size: PARTICLE_SIZE * (0.8 + Math.random() * 0.4), // Some variation in size
    };
  };
  
  // Draw the message flow visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const updateCanvasDimensions = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    // Create particles if needed
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < NUM_PARTICLES; i++) {
        particlesRef.current.push(null);
      }
    }
    
    // Reference nodes positions
    const producerX = canvas.width * 0.2;
    const topicX = canvas.width * 0.5;
    const consumersX = canvas.width * 0.8;
    
    const producerY = canvas.height * 0.5;
    const topicY = canvas.height * 0.5;
    const consumers = [
      { y: canvas.height * 0.2, color: '#3B82F6' }, // Group 1 - Blue
      { y: canvas.height * 0.5, color: '#10B981' }, // Group 2 - Green
      { y: canvas.height * 0.8, color: '#F59E0B' }  // Group 3 - Amber
    ];
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connecting lines
      ctx.strokeStyle = darkMode ? '#4B5563' : '#E5E7EB';
      ctx.lineWidth = 2;
      
      // Producer to Topic
      ctx.beginPath();
      ctx.moveTo(producerX, producerY);
      ctx.lineTo(topicX, topicY);
      ctx.stroke();
      
      // Topic to Consumers
      consumers.forEach(consumer => {
        ctx.beginPath();
        ctx.moveTo(topicX, topicY);
        ctx.lineTo(consumersX, consumer.y);
        ctx.stroke();
      });
      
      // Draw nodes
      // Producer
      ctx.beginPath();
      ctx.fillStyle = darkMode ? '#7C3AED' : '#8B5CF6';
      ctx.arc(producerX, producerY, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Topic
      ctx.beginPath();
      ctx.fillStyle = darkMode ? '#475569' : '#64748B';
      ctx.arc(topicX, topicY, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Consumers
      consumers.forEach(consumer => {
        ctx.beginPath();
        ctx.fillStyle = consumer.color;
        ctx.arc(consumersX, consumer.y, 15, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw particles
      particlesRef.current.forEach((particle, i) => {
        if (!particle) return;
        
        // Update particle position
        particle.progress += particle.speed / 100;
        
        // Bezier curve path for more natural movement
        const t = particle.progress;
        // For producer to topic
        if (particle.targetX === topicX) {
          const controlX = (producerX + topicX) / 2;
          const controlY = producerY - 30 + Math.random() * 60;
          
          particle.x = Math.pow(1 - t, 2) * producerX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * topicX;
          particle.y = Math.pow(1 - t, 2) * producerY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * topicY;
        } 
        // For topic to consumer
        else {
          const controlX = (topicX + consumersX) / 2;
          const startY = topicY;
          const controlY = (startY + particle.targetY) / 2 - 20 + Math.random() * 40;
          
          particle.x = Math.pow(1 - t, 2) * topicX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * consumersX;
          particle.y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * particle.targetY;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove particle if it reached its target
        if (particle.progress >= 1) {
          particlesRef.current[i] = null;
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [darkMode]);
  
  // Add new particles when counts change
  useEffect(() => {
    // Check if producer count increased
    if (producedCount > prevCountsRef.current.produced) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const producerX = canvas.width * 0.2;
      const topicX = canvas.width * 0.5;
      const producerY = canvas.height * 0.5;
      const topicY = canvas.height * 0.5;
      
      // Add new producer particle
      const emptySlotIndex = particlesRef.current.findIndex(p => p === null);
      if (emptySlotIndex !== -1) {
        particlesRef.current[emptySlotIndex] = createParticle(
          producerX, 
          producerY, 
          topicX, 
          topicY, 
          darkMode ? '#A78BFA' : '#8B5CF6'
        );
      }
    }
    
    // Check if consumer counts increased
    const consumerGroups = [
      { key: 'group1', color: '#3B82F6', y: 0.2 }, // Blue
      { key: 'group2', color: '#10B981', y: 0.5 }, // Green
      { key: 'group3', color: '#F59E0B', y: 0.8 }  // Amber
    ];
    
    consumerGroups.forEach((group, index) => {
      const key = group.key as keyof typeof consumedCounts;
      if (consumedCounts[key] > prevCountsRef.current[key as keyof typeof prevCountsRef.current]) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const topicX = canvas.width * 0.5;
        const topicY = canvas.height * 0.5;
        const consumersX = canvas.width * 0.8;
        const consumerY = canvas.height * group.y;
        
        // Add new consumer particle
        const emptySlotIndex = particlesRef.current.findIndex(p => p === null);
        if (emptySlotIndex !== -1) {
          particlesRef.current[emptySlotIndex] = createParticle(
            topicX, 
            topicY, 
            consumersX, 
            consumerY, 
            group.color
          );
        }
      }
    });
    
    // Update previous counts
    prevCountsRef.current = {
      produced: producedCount,
      group1: consumedCounts.group1,
      group2: consumedCounts.group2,
      group3: consumedCounts.group3
    };
  }, [producedCount, consumedCounts, darkMode]);
  
  return (
    <div className="w-full h-60">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default MessageFlow;