import { useRef } from "react";
import type { MouseEventHandler } from "react";

export function useDoubleClick<MouseEventHandler>(
  onDoubleClick: () => void,
  onClick: () => void,
  delay = 250
) {
  const clickCountRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const handleClick = () => {
    clickCountRef.current += 1;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (clickCountRef.current === 1) {
      // Schedule single click if no second click follows
      timeoutRef.current = window.setTimeout(() => {
        if (clickCountRef.current === 1) {
          onClick();
        }
        clickCountRef.current = 0;
      }, delay);
    } else if (clickCountRef.current === 2) {
      // Double click detected
      onDoubleClick();
      clickCountRef.current = 0;
    }
  };

  return handleClick;
}
