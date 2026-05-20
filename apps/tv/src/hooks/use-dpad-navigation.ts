import { useEffect, useCallback, useRef } from 'react';

/**
 * TV 遥控器 D-pad 导航 Hook
 * 管理焦点在 .tv-focusable 元素间的移动
 */
export function useDpadNavigation(containerRef: React.RefObject<HTMLElement | null>) {
  const focusIndexRef = useRef(0);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('.tv-focusable:not([disabled])')
    );
  }, [containerRef]);

  const focusElement = useCallback((index: number) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(index, elements.length - 1));
    focusIndexRef.current = clampedIndex;
    elements[clampedIndex]?.focus();
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const current = focusIndexRef.current;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        focusElement(current + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        focusElement(current - 1);
        break;
      case 'Enter':
        // 触发当前焦点元素的 click
        e.preventDefault();
        elements[current]?.click();
        break;
      default:
        break;
    }
  }, [getFocusableElements, focusElement]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // 初始聚焦第一个元素
    setTimeout(() => focusElement(0), 100);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, focusElement]);

  return { focusElement, getFocusableElements };
}
