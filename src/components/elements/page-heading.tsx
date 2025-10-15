"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const PageHeading = ({
  heading,
  subheading,
  padding,
}: {
  heading: string;
  subheading?: string;
  padding?: string;
}) => {
  return (
    <motion.section
      className={cn(
        "px-4 md:px-6 flex flex-col items-center justify-center text-center",
        padding ? padding : "py-24"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 uppercase font-sans"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {heading}
      </motion.h1>
      {subheading && (
        <motion.p
          className="text-base md:text-lg text-secondary-foreground/60 mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {subheading}
        </motion.p>
      )}
    </motion.section>
  );
};