import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { DataInput } from './components/DataInput';
import { CodePanel } from './components/CodePanel';
import { Canvas } from './components/Canvas';
import { Controls } from './components/Controls';
import { Modal } from './components/Modal';
import { AlgorithmIdea } from './components/Modal/AlgorithmIdea';
import { FloatingBall } from './components/FloatingBall';
import { generateSteps, EXAMPLE_DATA } from './algorithms/threeSum';
import type { AlgorithmStep } from './types';
import './App.css';

function App() {
  const [nums, setNums] = useState<number[]>(EXAMPLE_DATA[0].value);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showAlgorithmIdea, setShowAlgorithmIdea] = useState(false);
  
  const playIntervalRef = useRef<number | null>(null);

  // 生成步骤
  useEffect(() => {
    const newSteps = generateSteps(nums);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nums]);

  // 播放控制
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, speed, steps.length, currentStep]);

  // 停止播放当到达末尾
  useEffect(() => {
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handlePlayPause = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [currentStep, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  const handleDataChange = useCallback((newNums: number[]) => {
    setNums(newNums);
  }, []);

  return (
    <div className="app">
      <Header onShowAlgorithmIdea={() => setShowAlgorithmIdea(true)} />
      <DataInput onDataChange={handleDataChange} currentData={nums} />
      
      <div className="main-content">
        <div className="code-section">
          <CodePanel currentStep={steps[currentStep] || null} />
        </div>
        <div className="canvas-section">
          <Canvas currentStep={steps[currentStep] || null} />
        </div>
      </div>

      <Controls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
      />

      <Modal
        isOpen={showAlgorithmIdea}
        onClose={() => setShowAlgorithmIdea(false)}
        title="💡 算法思路"
      >
        <AlgorithmIdea />
      </Modal>

      <FloatingBall />
    </div>
  );
}

export default App;
