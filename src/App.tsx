import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { DataInput } from './components/DataInput';
import { CodePanel } from './components/CodePanel';
import { Canvas } from './components/Canvas';
import { Controls } from './components/Controls';
import { Modal } from './components/Modal';
import { AlgorithmIdea } from './components/Modal/AlgorithmIdea';
import { ProblemModal } from './components/Modal/ProblemModal';
import { FloatingBall } from './components/FloatingBall';
import { generateSteps, EXAMPLE_DATA } from './algorithms/threeSum';
import type { AlgorithmStep } from './types';
import './App.css';

function App() {
  const [nums, setNums] = useState<number[]>(EXAMPLE_DATA[0].value);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showAlgorithmIdea, setShowAlgorithmIdea] = useState(false);
  const [showProblemDescription, setShowProblemDescription] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  const playIntervalRef = useRef<number | null>(null);
  const steps: AlgorithmStep[] = useMemo(() => generateSteps(nums), [nums]);

  // 播放控制
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = Math.min(prev + 1, steps.length - 1);
          if (nextStep >= steps.length - 1) {
            setIsPlaying(false);
          }
          return nextStep;
        });
      }, 1000 / speed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, speed, steps.length, currentStep]);

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
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="app">
      <Header
        onShowAlgorithmIdea={() => setShowAlgorithmIdea(true)}
        onShowProblem={() => setShowProblemDescription(true)}
      />
      <DataInput onDataChange={handleDataChange} currentData={nums} />
      
      <div className={`main-content ${showCode ? 'has-code-drawer' : ''}`}>
        <div className="canvas-section">
          <Canvas currentStep={steps[currentStep] || null} playbackSpeed={speed} />
          <button
            className="canvas-code-toggle"
            type="button"
            aria-label={showCode ? '隐藏代码' : '查看代码'}
            aria-expanded={showCode}
            aria-controls="algorithm-code-drawer"
            onClick={() => setShowCode(open => !open)}
          >
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
        </div>
        <aside id="algorithm-code-drawer" className="code-drawer" aria-hidden={!showCode} inert={!showCode}>
          <div className="code-drawer-heading">
            <strong>算法代码</strong>
            <button type="button" aria-label="关闭代码面板" onClick={() => setShowCode(false)}>×</button>
          </div>
          <div className="code-drawer-body">
            <CodePanel currentStep={steps[currentStep] || null} />
          </div>
        </aside>
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

      <ProblemModal isOpen={showProblemDescription} onClose={() => setShowProblemDescription(false)} />

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
