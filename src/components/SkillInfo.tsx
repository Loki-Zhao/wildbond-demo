import { useEffect, useRef, useState, type HTMLAttributes } from "react";

const LONG_PRESS_MS = 450;
const AUTO_HIDE_MS = 4600;

export const useSkillInfo = () => {
  const [content, setContent] = useState<string | null>(null);
  const longPressTimer = useRef<number | undefined>(undefined);
  const autoHideTimer = useRef<number | undefined>(undefined);
  const clickBlockTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  };

  const showSkillInfo = (text: string) => {
    clearLongPress();
    if (autoHideTimer.current) window.clearTimeout(autoHideTimer.current);
    setContent(text);
    autoHideTimer.current = window.setTimeout(() => setContent(null), AUTO_HIDE_MS);
  };

  const releaseClickBlockSoon = () => {
    if (clickBlockTimer.current) window.clearTimeout(clickBlockTimer.current);
    clickBlockTimer.current = window.setTimeout(() => {
      longPressed.current = false;
      clickBlockTimer.current = undefined;
    }, 700);
  };

  useEffect(
    () => () => {
      clearLongPress();
      if (autoHideTimer.current) window.clearTimeout(autoHideTimer.current);
      if (clickBlockTimer.current) window.clearTimeout(clickBlockTimer.current);
    },
    []
  );

  const bindSkillInfo = (text: string): HTMLAttributes<HTMLElement> => ({
    title: text,
    onTouchStart: () => {
      clearLongPress();
      longPressed.current = false;
      longPressTimer.current = window.setTimeout(() => {
        longPressed.current = true;
        showSkillInfo(text);
      }, LONG_PRESS_MS);
    },
    onTouchEnd: () => {
      clearLongPress();
      if (longPressed.current) releaseClickBlockSoon();
    },
    onTouchCancel: () => {
      clearLongPress();
      if (longPressed.current) releaseClickBlockSoon();
    },
    onContextMenu: (event) => {
      event.preventDefault();
      longPressed.current = true;
      showSkillInfo(text);
      releaseClickBlockSoon();
    },
    onClickCapture: (event) => {
      if (!longPressed.current) return;
      event.preventDefault();
      event.stopPropagation();
      longPressed.current = false;
    }
  });

  const skillInfoPopup = content ? (
    <button className="skill-info-popover" type="button" onClick={() => setContent(null)}>
      {content}
    </button>
  ) : null;

  return { bindSkillInfo, showSkillInfo, skillInfoPopup };
};
