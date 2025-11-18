"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useMetaColor } from "@/hooks/use-meta-color";
import { meta } from "@/lib/config";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

export const ThemeToggle = ({ iconSize = "size-5" }: { iconSize?: string }) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setMetaColor(
      resolvedTheme === "dark" ? meta.colors.light : meta.colors.dark
    );
  }, [resolvedTheme, setTheme, setMetaColor]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
      className="size-9 rounded-full border border-border/70 bg-muted/30 text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition hover:bg-muted/50"
    >
      {resolvedTheme === "light" ? (
        <Icon
          className={iconSize}
          icon="line-md:moon-to-sunny-outline-loop-transition"
          key={resolvedTheme}
        />
      ) : (
        <Icon
          className={iconSize}
          icon="line-md:sunny-outline-to-moon-loop-transition"
          key={resolvedTheme}
        />
      )}
    </Button>
  );
};
