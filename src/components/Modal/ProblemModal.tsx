import { useEffect, useRef } from 'react';
import { ProblemBook } from './ProblemBook';
import './Modal.css';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProblemModal({ isOpen, onClose }: ProblemModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay problem-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="problem-modal" role="dialog" aria-modal="true" aria-labelledby="problem-modal-heading" aria-describedby="problem-book-title">
        <div className="problem-modal-toolbar">
          <h2 id="problem-modal-heading">题目描述</h2>
          <a href="https://leetcode.cn/problems/3sum/" target="_blank" rel="noopener noreferrer">在 LeetCode 打开</a>
          <button ref={closeRef} className="modal-close" aria-label="关闭题目原题" onClick={onClose}>×</button>
        </div>
        <div className="problem-modal-content"><ProblemBook /></div>
      </section>
    </div>
  );
}
