"use client";

import { motion } from "motion/react";
import { useState } from "react";
import css from "./styles.module.css";

// Custom easing function matching GSAP's "circleEase" (0.68, -0.55, 0.265, 1.55)
const circleEase = [0.68, -0.55, 0.265, 1.55] as const;

const dotDistance: number = 25;

// Animation variants for each dot based on the GSAP configuration
const dotVariants = [
  // Dot 0: top-left corner
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: dotDistance, y: dotDistance, scale: 1.2, opacity: 1 }
  },
  // Dot 1: top-center (fades out and scales up)
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: 0, y: 0, scale: 5, opacity: 0 }
  },
  // Dot 2: top-right corner
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: -dotDistance, y: dotDistance, scale: 1.2, opacity: 1 }
  },
  // Dot 3: middle-left (fades out and scales up)
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: 0, y: 0, scale: 5, opacity: 0 }
  },
  // Dot 4: center (scales up)
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: 0, y: 0, scale: 1.2, opacity: 1 }
  },
  // Dot 5: middle-right (fades out and scales up)
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: 0, y: 0, scale: 5, opacity: 0 }
  },
  // Dot 6: bottom-left corner
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: dotDistance, y: -dotDistance, scale: 1.2, opacity: 1 }
  },
  // Dot 7: bottom-center (fades out and scales up)
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: 0, y: 0, scale: 5, opacity: 0 }
  },
  // Dot 8: bottom-right corner
  {
    inactive: { x: 0, y: 0, scale: 1, opacity: 1 },
    active: { x: -dotDistance, y: -dotDistance, scale: 1.2, opacity: 1 }
  }
];

// Different durations for specific dots (matching GSAP config)
const dotDurations = [0.6, 0.6, 0.6, 0.3, 0.6, 0.4, 0.6, 0.5, 0.6];

export const MenuTrigger = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      className="relative grid place-items-center m-auto cursor-pointer size-11"
      onClick={() => setIsActive(!isActive)}
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <motion.div
          key={index}
          className={css.dot}
          initial="inactive"
          animate={isActive ? "active" : "inactive"}
          variants={dotVariants[index]}
          transition={{
            duration: dotDurations[index],
            ease: circleEase
          }}
        />
      ))}
    </div>
  );
};