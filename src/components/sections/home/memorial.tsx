"use client";

import { CardHeading } from "@/components/elements/card-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { motion } from "motion/react";
import Link from "next/link";

export const MemorialSection = () => {
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
          <motion.h2 className="text-3xl md:text-xl lg:text-2xl font-bold mb-6 flex items-center gap-3">
            <Icon icon="lucide:image" />
            Memorial Creator
          </motion.h2>

          <Card className="bg-card/50 backdrop-blur-sm border-none shadow-lg">
            <CardContent>
              <p className="text-base leading-relaxed text-pretty">
                Our image creation tool combines cherished photographs,
                meaningful quotes, and service information to help you easily
                design memorial cards and graphics. These personalized visual
                tributes can be displayed during services, shared with friends
                and family, or kept as lasting mementos of your loved one.
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Create an image{" "}
                <Icon icon="lucide:arrow-right" className="inline" />
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="flex-1 order-1 md:order-2 w-full">
          <MemorialCardDemo />
        </div>
      </motion.div>
    </motion.div>
  );
};

function MemorialCardDemo() {
  return (
    <motion.div
      className="relative h-[400px] w-full rounded-xl overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 p-6 flex flex-col">
        <CardHeading title="Memorial Card Creator" />

        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: false }}
        >
          <motion.div
            className="w-80 h-96 bg-gradient-to-b from-muted/5 to-primary/10 rounded-lg shadow-lg relative overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: false }}
          >
            <div className="absolute inset-0 flex flex-col">
              <div className="h-40 bg-primary/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-background/75 flex items-center justify-center">
                    <Icon icon="carbon:image" className="size-10 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 flex flex-col items-center text-center">
                <h4 className="text-lg font-medium mt-2">In Loving Memory</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  1945 - 2023
                </p>

                <div className="mt-4 h-px w-12 bg-primary/30" />

                <p className="mt-4 text-xs italic">
                  "Those we love don't go away, they walk beside us every day."
                </p>

                <div className="mt-auto">
                  <p className="text-xs text-muted-foreground">
                    Memorial Service
                  </p>
                  <p className="text-xs">Saturday, June 10, 2023</p>
                  <p className="text-xs">2:00 PM</p>
                </div>
              </div>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-primary"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ delay: 0.7, duration: 1.5, ease: "easeInOut" }}
              viewport={{ once: false }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}