"use client";

import { useEffect, useRef, useCallback } from "react";
import { gameEventBus } from "@/lib/phaser/events";

interface TabVisibilityOptions {
  onHidden?: () => void;
  onVisible?: () => void;
}

export function useTabVisibility(options?: TabVisibilityOptions): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleVisibilityChange = useCallback(() => {
    const isHidden = document.visibilityState === "hidden";

    if (isHidden) {
      gameEventBus.emit("set-target-fps", { fps: 5 });
      optionsRef.current?.onHidden?.();
    } else {
      gameEventBus.emit("set-target-fps", { fps: 60 });
      optionsRef.current?.onVisible?.();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
}
