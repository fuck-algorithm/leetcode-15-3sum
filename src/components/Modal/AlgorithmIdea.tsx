export function AlgorithmIdea() {
  return (
    <div className="algorithm-idea">
      <h3>题目描述</h3>
      <p>
        给你一个整数数组 <code>nums</code>，判断是否存在三元组 
        <code>[nums[i], nums[j], nums[k]]</code> 满足 <code>i ≠ j</code>、
        <code>i ≠ k</code> 且 <code>j ≠ k</code>，同时还满足 
        <code>nums[i] + nums[j] + nums[k] == 0</code>。
        返回所有和为 0 且不重复的三元组。
      </p>

      <h3>解题思路：排序 + 双指针</h3>
      <p>本题的难点在于如何去除重复解。</p>

      <h3>算法流程</h3>
      <ul>
        <li>
          <strong>特判：</strong>对于数组长度 n，如果数组为 null 或者数组长度小于 3，返回空数组。
        </li>
        <li>
          <strong>排序：</strong>对数组进行排序。
        </li>
        <li>
          <strong>遍历：</strong>遍历排序后数组：
          <ul>
            <li>若 <code>nums[i] &gt; 0</code>：因为已经排序好，所以后面不可能有三个数加和等于 0，直接返回结果。</li>
            <li>对于重复元素：跳过，避免出现重复解。</li>
            <li>
              令左指针 <code>L = i + 1</code>，右指针 <code>R = n - 1</code>，当 <code>L &lt; R</code> 时，执行循环：
              <ul>
                <li>当 <code>nums[i] + nums[L] + nums[R] == 0</code>，记录结果，同时跳过重复的 L 和 R，然后 L++, R--</li>
                <li>若和大于 0，说明 <code>nums[R]</code> 太大，R 左移</li>
                <li>若和小于 0，说明 <code>nums[L]</code> 太小，L 右移</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>

      <h3>复杂度分析</h3>
      <ul>
        <li><strong>时间复杂度：</strong>O(n²)，数组排序 O(NlogN)，遍历数组 O(n)，双指针遍历 O(n)，总体 O(n²)</li>
        <li><strong>空间复杂度：</strong>O(logN)，排序所需的额外空间</li>
      </ul>

      <h3>为什么用双指针？</h3>
      <p>
        如果固定了前两重循环枚举到的元素 a 和 b，那么只有唯一的 c 满足 <code>a + b + c = 0</code>。
        当第二重循环往后枚举一个元素 b' 时，由于 <code>b' &gt; b</code>，
        那么满足 <code>a + b' + c' = 0</code> 的 c' 一定有 <code>c' &lt; c</code>。
        也就是说，我们可以从小到大枚举 b，同时从大到小枚举 c，这就是双指针的核心思想。
      </p>
    </div>
  );
}
