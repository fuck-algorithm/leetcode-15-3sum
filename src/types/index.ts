// 算法步骤类型
export interface AlgorithmStep {
  id: number;
  description: string;
  // 代码行号映射：语言 -> 行号数组
  codeLines: {
    java: number[];
    python: number[];
    golang: number[];
    javascript: number[];
  };
  // 变量状态
  variables: VariableState[];
  // 数组状态
  arrayState: ArrayElementState[];
  // 结果状态
  result: number[][];
  // 指针位置
  pointers: PointerState;
  // 动画类型
  animationType: 'init' | 'sort' | 'move-i' | 'move-left' | 'move-right' | 'found' | 'skip' | 'compare' | 'complete';
}

export interface VariableState {
  name: string;
  value: string | number | number[] | number[][];
  highlight?: boolean;
}

export interface ArrayElementState {
  index: number;
  value: number;
  originalIndex: number;
  highlight: 'none' | 'i' | 'left' | 'right' | 'found' | 'skip';
}

export interface PointerState {
  i: number;
  left: number;
  right: number;
}

// 支持的编程语言
export type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}

// IndexedDB存储的设置
export interface UserSettings {
  language: ProgrammingLanguage;
  playbackSpeed: number;
  githubStars: number;
  githubStarsLastFetch: number;
}
