import { useEffect, useState, useCallback } from 'react';
import { getPlaybackSpeed, savePlaybackSpeed } from '../../utils/storage';
import './Controls.css';

interface ControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function Controls({
  currentStep,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
  onSeek,
  onSpeedChange
}: ControlsProps) {
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    getPlaybackSpeed().then(savedSpeed => {
      setSpeed(savedSpeed);
      onSpeedChange(savedSpeed);
    });
  }, [onSpeedChange]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    savePlaybackSpeed(newSpeed);
    onSpeedChange(newSpeed);
    setShowSpeedMenu(false);
  };

  // 键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case ' ':
        e.preventDefault();
        onPlayPause();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        onReset();
        break;
    }
  }, [onPrevious, onNext, onPlayPause, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const step = Math.round(percentage * (totalSteps - 1));
    onSeek(Math.max(0, Math.min(totalSteps - 1, step)));
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  return (
    <div className="controls">
      <div className="controls-main">
        <button className="control-btn" onClick={onPrevious} disabled={currentStep === 0}>
          ⏮ 上一步 <kbd>←</kbd>
        </button>
        
        <button className="control-btn play-btn" onClick={onPlayPause}>
          {isPlaying ? '⏸ 暂停' : '▶ 播放'} <kbd>空格</kbd>
        </button>
        
        <button className="control-btn" onClick={onNext} disabled={currentStep >= totalSteps - 1}>
          下一步 ⏭ <kbd>→</kbd>
        </button>
        
        <button className="control-btn reset-btn" onClick={onReset}>
          ↺ 重置 <kbd>R</kbd>
        </button>

        <div className="speed-control">
          <button 
            className="speed-btn"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            {speed}x 速度
          </button>
          {showSpeedMenu && (
            <div className="speed-menu">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`speed-option ${speed === s ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="step-info">
          步骤 {currentStep + 1} / {totalSteps}
        </div>
      </div>

      <div 
        className="progress-bar"
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
      >
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="progress-thumb"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
