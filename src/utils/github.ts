import { getGithubStars, saveGithubStars } from './storage';

const REPO_OWNER = 'fuck-algorithm';
const REPO_NAME = 'leetcode-15-3sum';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时

export const GITHUB_REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export async function fetchGithubStars(): Promise<number> {
  try {
    // 检查缓存
    const cached = await getGithubStars();
    const now = Date.now();
    
    // 如果缓存未过期，直接返回缓存值
    if (cached.lastFetch && now - cached.lastFetch < CACHE_DURATION) {
      return cached.stars;
    }

    // 获取新数据
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    if (!response.ok) {
      throw new Error('GitHub API请求失败');
    }

    const data = await response.json();
    const stars = data.stargazers_count || 0;
    
    // 保存到缓存
    await saveGithubStars(stars);
    
    return stars;
  } catch (error) {
    console.error('获取GitHub Stars失败:', error);
    // 返回缓存值或默认值
    const cached = await getGithubStars();
    return cached.stars || 0;
  }
}
