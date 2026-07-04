import type { AlgorithmStep, ArrayElementState, VariableState, PointerState, StepDecision } from '../types';

// 生成算法执行步骤
export function generateSteps(nums: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  let stepId = 0;

  // 创建带原始索引的数组
  const indexedNums = nums.map((value, index) => ({ value, originalIndex: index }));
  
  // 初始状态
  steps.push(createStep(
    stepId++,
    '初始化：接收输入数组',
    { java: [3], python: [2], golang: [3], javascript: [2] },
    [{ name: 'nums', value: nums.slice(), highlight: true }],
    indexedNums.map((item, idx) => ({
      index: idx,
      value: item.value,
      originalIndex: item.originalIndex,
      highlight: 'none' as const
    })),
    [],
    { i: -1, left: -1, right: -1 },
    'init',
    { action: '读取原始数组，准备排序后使用双指针扫描' }
  ));

  // 特判
  if (n < 3) {
    steps.push(createStep(
      stepId++,
      '数组长度小于3，返回空数组',
      { java: [5, 6], python: [4, 5], golang: [5, 6], javascript: [4, 5] },
      [{ name: 'n', value: n, highlight: true }],
      indexedNums.map((item, idx) => ({
        index: idx,
        value: item.value,
        originalIndex: item.originalIndex,
        highlight: 'none' as const
      })),
      [],
      { i: -1, left: -1, right: -1 },
      'complete',
      { action: '不足三个元素，无法组成三元组' }
    ));
    return steps;
  }

  // 排序
  indexedNums.sort((a, b) => a.value - b.value);
  const sortedNums = indexedNums.map(item => item.value);
  
  steps.push(createStep(
    stepId++,
    '对数组进行排序',
    { java: [7], python: [6], golang: [7], javascript: [6] },
    [{ name: 'nums(sorted)', value: sortedNums.slice(), highlight: true }],
    indexedNums.map((item, idx) => ({
      index: idx,
      value: item.value,
      originalIndex: item.originalIndex,
      highlight: 'none' as const
    })),
    [],
    { i: -1, left: -1, right: -1 },
    'sort',
    { action: '排序让双指针可以根据 sum 与 0 的关系单调移动' }
  ));

  const result: number[][] = [];

  // 遍历
  for (let i = 0; i < n - 2; i++) {
    // 跳过重复元素
    if (i > 0 && sortedNums[i] === sortedNums[i - 1]) {
      steps.push(createStep(
        stepId++,
        `i=${i}: nums[${i}]=${sortedNums[i]} 与前一个元素相同，跳过避免重复`,
        { java: [11, 12], python: [9, 10], golang: [11, 12], javascript: [9, 10] },
        [
          { name: 'i', value: i, highlight: true },
          { name: 'nums[i]', value: sortedNums[i] },
          { name: 'nums[i-1]', value: sortedNums[i - 1] }
        ],
        createArrayState(indexedNums, i, -1, -1, 'skip'),
        result.slice(),
        { i, left: -1, right: -1 },
        'skip',
        { action: '固定值重复，跳过以避免生成重复三元组', movedPointer: 'i' }
      ));
      continue;
    }

    // 剪枝：如果当前数大于0，后面不可能有三数之和为0
    if (sortedNums[i] > 0) {
      steps.push(createStep(
        stepId++,
        `i=${i}: nums[${i}]=${sortedNums[i]} > 0，后续不可能有三数之和为0，提前结束`,
        { java: [9, 10], python: [7, 8], golang: [9, 10], javascript: [7, 8] },
        [{ name: 'i', value: i }, { name: 'nums[i]', value: sortedNums[i], highlight: true }],
        createArrayState(indexedNums, i, -1, -1, 'i'),
        result.slice(),
        { i, left: -1, right: -1 },
        'complete',
        { action: '当前固定值已经大于 0，右侧更大，不可能再凑出 0' }
      ));
      break;
    }

    let left = i + 1;
    let right = n - 1;

    steps.push(createStep(
      stepId++,
      `i=${i}: 固定 nums[${i}]=${sortedNums[i]}，初始化双指针 left=${left}, right=${right}`,
      { java: [14, 15], python: [11, 12], golang: [14, 15], javascript: [11, 12] },
      [
        { name: 'i', value: i },
        { name: 'nums[i]', value: sortedNums[i], highlight: true },
        { name: 'left', value: left },
        { name: 'right', value: right }
      ],
      createArrayState(indexedNums, i, left, right),
      result.slice(),
      { i, left, right },
      'move-i',
      { target: -sortedNums[i], action: `固定 i，接下来在右侧窗口寻找两数之和 ${-sortedNums[i]}` }
    ));

    while (left < right) {
      const sum = sortedNums[i] + sortedNums[left] + sortedNums[right];
      const target = -sortedNums[i];

      steps.push(createStep(
        stepId++,
        `计算三数之和: ${sortedNums[i]} + ${sortedNums[left]} + ${sortedNums[right]} = ${sum}`,
        { java: [17, 18], python: [14], golang: [17, 18], javascript: [14] },
        [
          { name: 'i', value: i },
          { name: 'left', value: left },
          { name: 'right', value: right },
          { name: 'sum', value: sum, highlight: true },
          { name: 'target', value: target }
        ],
        createArrayState(indexedNums, i, left, right),
        result.slice(),
        { i, left, right },
        'compare',
        {
          sum,
          target,
          relation: getRelation(sum),
          action: '计算当前三元组的和，并与 0 比较'
        }
      ));

      if (sum === 0) {
        result.push([sortedNums[i], sortedNums[left], sortedNums[right]]);
        
        steps.push(createStep(
          stepId++,
          `找到一组解: [${sortedNums[i]}, ${sortedNums[left]}, ${sortedNums[right]}]`,
          { java: [20], python: [16], golang: [20], javascript: [16] },
          [
            { name: 'triplet', value: [sortedNums[i], sortedNums[left], sortedNums[right]], highlight: true }
          ],
          createArrayState(indexedNums, i, left, right, 'found'),
          result.slice(),
          { i, left, right },
          'found',
          {
            sum,
            target,
            relation: 'equal',
            action: 'sum 命中 0，记录当前三元组',
            triplet: [sortedNums[i], sortedNums[left], sortedNums[right]]
          }
        ));

        // 跳过重复的left
        while (left < right && sortedNums[left] === sortedNums[left + 1]) {
          const previousPointers = { i, left, right };
          left++;
          steps.push(createStep(
            stepId++,
            `跳过重复的left: left=${left}`,
            { java: [21, 22], python: [17, 18], golang: [21, 22], javascript: [17, 18] },
            [{ name: 'left', value: left, highlight: true }],
            createArrayState(indexedNums, i, left, right, 'skip'),
            result.slice(),
            { i, left, right },
            'skip',
            {
              sum,
              target,
              relation: 'equal',
              action: 'left 右侧仍是相同值，继续跳过重复组合',
              movedPointer: 'left',
              previousPointers
            }
          ));
        }

        // 跳过重复的right
        while (left < right && sortedNums[right] === sortedNums[right - 1]) {
          const previousPointers = { i, left, right };
          right--;
          steps.push(createStep(
            stepId++,
            `跳过重复的right: right=${right}`,
            { java: [23, 24], python: [19, 20], golang: [23, 24], javascript: [19, 20] },
            [{ name: 'right', value: right, highlight: true }],
            createArrayState(indexedNums, i, left, right, 'skip'),
            result.slice(),
            { i, left, right },
            'skip',
            {
              sum,
              target,
              relation: 'equal',
              action: 'right 左侧仍是相同值，继续跳过重复组合',
              movedPointer: 'right',
              previousPointers
            }
          ));
        }

        const previousPointers = { i, left, right };
        left++;
        right--;
        
        if (left < right) {
          steps.push(createStep(
            stepId++,
            `移动双指针: left=${left}, right=${right}`,
            { java: [25, 26], python: [21, 22], golang: [25, 26], javascript: [21, 22] },
            [
              { name: 'left', value: left, highlight: true },
              { name: 'right', value: right, highlight: true }
            ],
            createArrayState(indexedNums, i, left, right),
            result.slice(),
            { i, left, right },
            'move-left',
            {
              sum,
              target,
              relation: 'equal',
              action: '命中后同时收缩两端，继续查找下一组不重复解',
              movedPointer: 'both',
              previousPointers
            }
          ));
        }
      } else if (sum > 0) {
        const previousPointers = { i, left, right };
        right--;
        steps.push(createStep(
          stepId++,
          `sum=${sum} > 0，需要减小和，right左移: right=${right}`,
          { java: [27, 28], python: [23, 24], golang: [27, 28], javascript: [23, 24] },
          [
            { name: 'sum', value: sum },
            { name: 'right', value: right, highlight: true }
          ],
          createArrayState(indexedNums, i, left, right),
          result.slice(),
          { i, left, right },
          'move-right',
          {
            sum,
            target,
            relation: 'greater',
            action: 'sum 大于 0，右侧值偏大，right 左移以减小总和',
            movedPointer: 'right',
            previousPointers
          }
        ));
      } else {
        const previousPointers = { i, left, right };
        left++;
        steps.push(createStep(
          stepId++,
          `sum=${sum} < 0，需要增大和，left右移: left=${left}`,
          { java: [29, 30], python: [25, 26], golang: [29, 30], javascript: [25, 26] },
          [
            { name: 'sum', value: sum },
            { name: 'left', value: left, highlight: true }
          ],
          createArrayState(indexedNums, i, left, right),
          result.slice(),
          { i, left, right },
          'move-left',
          {
            sum,
            target,
            relation: 'less',
            action: 'sum 小于 0，左侧值偏小，left 右移以增大总和',
            movedPointer: 'left',
            previousPointers
          }
        ));
      }
    }
  }

  // 完成
  steps.push(createStep(
    stepId++,
    `算法完成，共找到 ${result.length} 组解`,
    { java: [32], python: [27], golang: [32], javascript: [27] },
    [{ name: 'result', value: result, highlight: true }],
    indexedNums.map((item, idx) => ({
      index: idx,
      value: item.value,
      originalIndex: item.originalIndex,
      highlight: 'none' as const
    })),
    result.slice(),
    { i: -1, left: -1, right: -1 },
    'complete',
    { action: `扫描结束，共找到 ${result.length} 组不重复三元组` }
  ));

  return steps;
}

function createStep(
  id: number,
  description: string,
  codeLines: { java: number[]; python: number[]; golang: number[]; javascript: number[] },
  variables: VariableState[],
  arrayState: ArrayElementState[],
  result: number[][],
  pointers: PointerState,
  animationType: AlgorithmStep['animationType'],
  decision?: StepDecision
): AlgorithmStep {
  return { id, description, codeLines, variables, arrayState, result, pointers, animationType, decision };
}

function createArrayState(
  indexedNums: { value: number; originalIndex: number }[],
  i: number,
  left: number,
  right: number,
  specialHighlight?: 'found' | 'skip' | 'i'
): ArrayElementState[] {
  return indexedNums.map((item, idx) => {
    let highlight: ArrayElementState['highlight'] = 'none';
    if (specialHighlight === 'found' && (idx === i || idx === left || idx === right)) {
      highlight = 'found';
    } else if (idx === i) {
      highlight = specialHighlight === 'skip' ? 'skip' : 'i';
    } else if (idx === left) {
      highlight = specialHighlight === 'skip' ? 'skip' : 'left';
    } else if (idx === right) {
      highlight = specialHighlight === 'skip' ? 'skip' : 'right';
    }
    
    return {
      index: idx,
      value: item.value,
      originalIndex: item.originalIndex,
      highlight
    };
  });
}

function getRelation(sum: number): StepDecision['relation'] {
  if (sum === 0) return 'equal';
  return sum < 0 ? 'less' : 'greater';
}

// 验证输入数据
export function validateInput(input: string): { valid: boolean; nums?: number[]; error?: string } {
  try {
    // 尝试解析JSON数组
    const parsed = JSON.parse(input);
    
    if (!Array.isArray(parsed)) {
      return { valid: false, error: '输入必须是数组格式' };
    }

    if (parsed.length < 3) {
      return { valid: false, error: '数组长度必须至少为3' };
    }

    if (parsed.length > 3000) {
      return { valid: false, error: '数组长度不能超过3000' };
    }

    for (const num of parsed) {
      if (typeof num !== 'number' || !Number.isInteger(num)) {
        return { valid: false, error: '数组元素必须是整数' };
      }
      if (num < -100000 || num > 100000) {
        return { valid: false, error: '数组元素必须在 -10^5 到 10^5 之间' };
      }
    }

    return { valid: true, nums: parsed };
  } catch {
    return { valid: false, error: '输入格式错误，请输入有效的JSON数组' };
  }
}

// 生成随机测试数据
export function generateRandomInput(): number[] {
  const length = Math.floor(Math.random() * 8) + 5; // 5-12个元素
  const nums: number[] = [];
  
  // 确保生成的数据有解的概率较高
  const hasZero = Math.random() > 0.5;
  if (hasZero) {
    nums.push(0);
  }

  // 生成一些正负数对
  const pairs = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < pairs; i++) {
    const val = Math.floor(Math.random() * 10) + 1;
    nums.push(val);
    nums.push(-val);
  }

  // 填充剩余元素
  while (nums.length < length) {
    nums.push(Math.floor(Math.random() * 21) - 10); // -10 到 10
  }

  // 打乱数组
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  return nums;
}

// 示例数据
export const EXAMPLE_DATA = [
  { label: '示例1', value: [-1, 0, 1, 2, -1, -4] },
  { label: '示例2', value: [0, 1, 1] },
  { label: '示例3', value: [0, 0, 0] },
  { label: '多解', value: [-2, -1, 0, 1, 2, 3] },
  { label: '全零', value: [0, 0, 0, 0, 0] },
];
