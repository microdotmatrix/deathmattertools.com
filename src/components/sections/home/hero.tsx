"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.section
      className="min-h-screen flex flex-col items-center justify-end px-4 md:px-6 py-12 text-center relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Image
        src="/images/fs-img_02.jpg"
        alt="Death Matter"
        fill
        className={cn(
          "object-cover object-left z-[-1] mask-b-from-25% mask-b-to-90% opacity-75 transition-all duration-1000 delay-200 ease-out",
          loaded ? "blur-none scale-100" : "blur-xl opacity-0 scale-110"
        )}
        onLoad={() => setLoaded(true)}
      />
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-0 lg:mb-8"
        >
          <div className="size-32 md:size-48 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl md:text-5xl font-bold text-primary">
              DM
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 uppercase font-sans"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Death Matter
        </motion.h1>
      </div>

      <div className="flex flex-col items-center justify-center mb-20">
        <motion.p
          className="max-w-3xl text-base md:text-md text-accent-foreground/60 mb-16 text-balance tracking-wider"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Death Matter combines compassion, experience in the grieving process,
          and advanced technology to help people prepare and work through the
          administrative burden that accompanies death in our current time. When
          you use Death Matter tools, you transform a difficult experience into
          one that's more manageable and meaningful.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button
            size="lg"
            variant="ghost"
            className="text-base md:text-lg md:px-12 md:py-8"
          >
            <a href="#obituary-writer" className="flex items-center gap-2">
              Learn More
              <motion.span
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.25, duration: 0.25 }}
              >
                <Icon
                  icon="carbon:arrow-down"
                  className="size-8 mt-2 text-muted-foreground/50 animate-bounce"
                />
              </motion.span>
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};