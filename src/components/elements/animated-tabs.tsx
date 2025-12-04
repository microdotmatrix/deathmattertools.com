"use client";

import { LayoutGroup, MotionConfig, motion } from "motion/react";
import { Activity, type ReactNode, useState } from "react";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/utils";

type Tab = {
  id: number;
  label: string;
  content: ReactNode;
};

interface DirectionAwareTabsProps {
  tabs: Tab[];
  className?: string;
  rounded?: string;
  onChange?: (tabId: number) => void;
}

const DirectionAwareTabs = ({
  tabs,
  className,
  rounded,
  onChange,
}: DirectionAwareTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [ref, bounds] = useMeasure();

  const handleTabClick = (newTabId: number) => {
    if (newTabId !== activeTab) {
      setActiveTab(newTabId);
      onChange?.(newTabId);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <LayoutGroup>
        <div
          className={cn(
            "flex space-x-1 border border-none rounded-full cursor-pointer bg-neutral-600 p-0.5 shadow-inner",
            className,
            rounded
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm sm:text-base font-normal text-accent-foreground transition-all duration-200 ease-in-out focus-visible:outline-1 focus-visible:ring-1 focus-visible:outline-none flex gap-2 items-center",
                activeTab === tab.id
                  ? "text-foreground font-semibold"
                  : "hover:text-accent-foreground text-accent-foreground/75",
                rounded
              )}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="bubble"
                  className="absolute inset-0 z-10 bg-muted mix-blend-soft-light border border-border/10"
                  style={rounded ? { borderRadius: 9 } : { borderRadius: 9999 }}
                  transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </LayoutGroup>

      <MotionConfig transition={{ duration: 0.3, type: "spring", bounce: 0.15 }}>
        <motion.div
          className="relative mx-auto w-full overflow-hidden"
          initial={false}
          animate={{ height: bounds.height }}
        >
          <div className="p-1" ref={ref}>
            {tabs.map((tab) => (
              <Activity
                key={tab.id}
                mode={activeTab === tab.id ? "visible" : "hidden"}
              >
                {tab.content}
              </Activity>
            ))}
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
};
export { DirectionAwareTabs };
