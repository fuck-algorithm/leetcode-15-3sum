import { useState } from 'react';
import { validateInput, generateRandomInput, EXAMPLE_DATA } from '../../algorithms/threeSum';
import './DataInput.css';

interface DataInputProps {
  onDataChange: (nums: number[]) => void;
  currentData: number[];
}

export function DataInput({ onDataChange, currentData }: DataInputProps) {
  const [inputValue, setInputValue] = useState(JSON.stringify(currentData));
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(null);
  };

  const handleApply = () => {
    const result = validateInput(inputValue);
    if (result.valid && result.nums) {
      onDataChange(result.nums);
      setError(null);
    } else {
      setError(result.error || '输入无效');
    }
  };

  const handleExampleClick = (data: number[]) => {
    setInputValue(JSON.stringify(data));
    setError(null);
    onDataChange(data);
  };

  const handleRandom = () => {
    const randomData = generateRandomInput();
    setInputValue(JSON.stringify(randomData));
    setError(null);
    onDataChange(randomData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="data-input">
      <div className="input-row">
        <label className="input-label">输入数组:</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例如: [-1, 0, 1, 2, -1, -4]"
        />
        <button className="apply-btn" onClick={handleApply}>
          应用
        </button>
        <button className="random-btn" onClick={handleRandom}>
          🎲 随机
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="examples-row">
        <span className="examples-label">示例:</span>
        {EXAMPLE_DATA.map((example, index) => (
          <button
            key={index}
            className={`example-btn ${JSON.stringify(currentData) === JSON.stringify(example.value) ? 'active' : ''}`}
            onClick={() => handleExampleClick(example.value)}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
