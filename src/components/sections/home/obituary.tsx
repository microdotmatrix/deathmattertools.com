"use client";

import { CardHeading } from "@/components/elements/card-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { motion } from "motion/react";
import Link from "next/link";

export const ObituarySection = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={container}
    >
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row items-center gap-12"
      >
        <div className="flex-1 order-2 md:order-1">
          <motion.h2 className="font-bold text-3xl md:text-xl lg:text-2xl  mb-6 flex items-center gap-3">
            <Icon icon="lucide:file-edit" />
            Obituary Writer
          </motion.h2>

          <Card className="bg-card/50 backdrop-blur-sm border-none shadow-lg">
            <CardContent>
              <p className="text-base leading-relaxed text-pretty">
                Death Matter helps funeral homes and individuals research the
                deceased, draft thoughtful obituaries based on personal
                characteristics, and facilitates a collaborative, human-centered
                approach. Our technology eases the emotional burden of preparing
                obituaries while ensuring the final tribute reflects the unique
                life being honored.
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Write an obituary{" "}
                <Icon icon="lucide:arrow-right" className="inline" />
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="flex-1 order-1 md:order-2 w-full">
          <ObituaryWriterDemo />
        </div>
      </motion.div>
    </motion.div>
  );
};

function ObituaryWriterDemo() {
  return (
    <motion.div
      className="relative h-[400px] w-full rounded-xl overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: false }}
    >
      <div className="absolute inset-0 p-6 flex flex-col">
        <CardHeading title="Obituary Writer" />

        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: false }}
        >
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h4 className="text-sm font-medium mb-2">Personal Details</h4>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-primary/10 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex-1 bg-muted/30 p-4 rounded-lg relative overflow-hidden">
            <h4 className="text-sm font-medium mb-2">Generated Obituary</h4>
            <div className="space-y-2">
              <div className="h-4 w-full bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-primary/10 rounded animate-pulse" />
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-primary origin-left w-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}