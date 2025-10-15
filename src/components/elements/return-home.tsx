"use client";

import { motion } from "motion/react";

export const ReturnHome = () => {
  return (
    <motion.a
      href="/"
      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      Return Home
    </motion.a>
  );
};