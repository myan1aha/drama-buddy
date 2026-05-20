/**
 * 简易用户身份管理
 * - 生成唯一 userId (nanoid)
 * - localStorage 持久化
 * - 提供给所有 API 调用使用
 */

const STORAGE_KEY = 'drama-buddy-user-id';
const NICKNAME_KEY = 'drama-buddy-nickname';

/** 生成短唯一 ID (无需外部依赖) */
function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Date.now().toString(36),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ];
  return segments.join('-');
}

/** 获取或创建 userId */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server';

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/** 获取昵称 */
export function getNickname(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(NICKNAME_KEY);
}

/** 设置昵称 */
export function setNickname(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NICKNAME_KEY, name);
}

/** 重置身份（调试/登出） */
export function resetIdentity(): string {
  const newId = generateId();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newId);
    localStorage.removeItem(NICKNAME_KEY);
  }
  return newId;
}

/** 检查是否首次使用 */
export function isNewUser(): boolean {
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem(STORAGE_KEY);
}
