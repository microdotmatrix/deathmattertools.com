"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useMetaColor } from "@/hooks/use-meta-color";
import { meta } from "@/lib/config";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

const themeOrder = ["light", "dark", "system"] as const;

export const ThemeToggle = ({ iconSize = "size-5" }: { iconSize?: string }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const cycleTheme = useCallback(() => {
    const currentIndex = themeOrder.indexOf(theme as typeof themeOrder[number]);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    setTheme(nextTheme);
    
    // For system theme, use the resolved theme to determine meta color
    const effectiveTheme = nextTheme === "system" ? resolvedTheme : nextTheme;
    setMetaColor(effectiveTheme === "dark" ? meta.colors.dark : meta.colors.light);
  }, [theme, resolvedTheme, setTheme, setMetaColor]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getIcon = () => {
    if (theme === "system") {
      return "mdi:desktop-mac";
    }
    return resolvedTheme === "light"
      ? "line-md:moon-to-sunny-outline-loop-transition"
      : "line-md:sunny-outline-to-moon-loop-transition";
  };

  const getLabel = () => {
    if (theme === "system") return "System theme";
    return resolvedTheme === "light" ? "Light theme" : "Dark theme";
  };

  return (
    <Button
      aria-label={`Current: ${getLabel()}. Click to cycle theme`}
      onClick={cycleTheme}
      size="icon"
      variant="ghost"
      className="size-9 rounded-full border border-border/70 bg-muted/30 text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition hover:bg-muted/50"
    >
      <Icon className={iconSize} icon={getIcon()} key={theme} />
    </Button>
  );
};
