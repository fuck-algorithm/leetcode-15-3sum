import './ProblemBook.css';

const examples = [
  {
    title: '示例 1',
    input: 'nums = [-1,0,1,2,-1,-4]',
    output: '[[-1,-1,2],[-1,0,1]]',
    explanation: '不同的三元组是 [-1,0,1] 和 [-1,-1,2]。'
  },
  {
    title: '示例 2',
    input: 'nums = [0,1,1]',
    output: '[]',
    explanation: '唯一可能的三元组和不为 0。'
  },
  {
    title: '示例 3',
    input: 'nums = [0,0,0]',
    output: '[[0,0,0]]',
    explanation: '唯一可能的三元组和为 0。'
  }
];

export function ProblemBook() {
  return (
    <article className="problem-book" aria-label="LeetCode 第十五题原题">
      <div className="book-running-head">
        <span>LEETCODE · HOT 100</span>
        <span>双指针 / 排序</span>
      </div>

      <div className="book-spread">
        <section className="book-page book-page--title" aria-labelledby="problem-book-title">
          <div className="book-page-topline"><span>第 15 题</span><span className="book-difficulty">中等</span></div>
          <h2 id="problem-book-title">三数之和</h2>
          <p className="book-deck">从一组整数中，找出所有不重复的三元组，让它们的和等于零。</p>
          <div className="book-rule" />
          <p className="book-page-note">阅读题意时，先记住两个条件：</p>
          <ul className="book-key-points">
            <li>三个元素必须来自不同下标。</li>
            <li>答案中不能出现重复的三元组。</li>
          </ul>
          <div className="book-page-number">15</div>
        </section>

        <section className="book-page book-page--content" aria-label="题目描述与示例">
          <h3>题目描述</h3>
          <p>给你一个整数数组 <code>nums</code>，请你判断是否存在满足以下条件的三元组 <code>[nums[i], nums[j], nums[k]]</code>：</p>
          <ul>
            <li><code>i != j</code>、<code>i != k</code> 且 <code>j != k</code></li>
            <li><code>nums[i] + nums[j] + nums[k] == 0</code></li>
          </ul>
          <p>请你返回所有和为 <code>0</code> 且不重复的三元组。</p>

          <h3 className="book-section-heading">示例</h3>
          <div className="book-examples">
            {examples.map(example => (
              <section className="book-example" key={example.title} aria-label={example.title}>
                <h4>{example.title}</h4>
                <p><span>输入</span><code>{example.input}</code></p>
                <p><span>输出</span><code>{example.output}</code></p>
                <p className="book-explanation">{example.explanation}</p>
              </section>
            ))}
          </div>

          <h3 className="book-section-heading">提示</h3>
          <ul className="book-constraints">
            <li><code>3 &lt;= nums.length &lt;= 3000</code></li>
            <li><code>-10⁵ &lt;= nums[i] &lt;= 10⁵</code></li>
          </ul>
          <div className="book-page-number">题目原文 · 15</div>
          <footer className="book-citation">题目整理自 LeetCode 中文站 · 15. 三数之和</footer>
        </section>
      </div>
    </article>
  );
}
