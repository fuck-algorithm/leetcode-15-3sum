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

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

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
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

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
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable)) return;
    
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

  const seekAt = (clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0) return;
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(Math.round(percentage * (totalSteps - 1)));
  };

  const handleProgressPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingProgress(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    seekAt(event.clientX, event.currentTarget);
  };

  const handleProgressPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingProgress) seekAt(event.clientX, event.currentTarget);
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
        role="slider"
        aria-label="演示进度"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep + 1}
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') onSeek(Math.max(0, currentStep - 1));
          if (event.key === 'ArrowRight') onSeek(Math.min(totalSteps - 1, currentStep + 1));
          if (event.key === 'Home') onSeek(0);
          if (event.key === 'End') onSeek(totalSteps - 1);
        }}
        onClick={event => { event.stopPropagation(); seekAt(event.clientX, event.currentTarget); }}
        onPointerDown={event => { event.stopPropagation(); handleProgressPointerDown(event); }}
        onPointerMove={handleProgressPointerMove}
        onPointerUp={() => setIsDraggingProgress(false)}
        onPointerCancel={() => setIsDraggingProgress(false)}
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
