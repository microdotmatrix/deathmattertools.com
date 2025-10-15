"use client";

import { CardHeading } from "@/components/elements/card-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { motion } from "motion/react";
import Link from "next/link";

export const QuotesSection = () => {
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
        <div className="flex-1 w-full">
          <QuoteGeneratorDemo />
        </div>

        <div className="flex-1">
          <motion.h2 className="font-bold text-3xl md:text-xl lg:text-2xl mb-6 flex items-center gap-3">
            <Icon icon="lucide:quote" />
            Quote Generator
          </motion.h2>

          <Card className="bg-card/50 backdrop-blur-sm border-none shadow-lg">
            <CardContent>
              <p className="text-base leading-relaxed text-pretty">
                Many people struggle to find the perfect words to encapsulate
                their loved one's spirit and legacy. Death Matter analyzes the
                individual's characteristics and life story to suggest
                meaningful quotes that beautifully capture their essence and
                memory, providing comfort during a challenging time.
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href="/quotes"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Search quotes{" "}
                <Icon icon="lucide:arrow-right" className="inline" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

function QuoteGeneratorDemo() {
  return (
    <motion.div
      className="relative h-[400px] w-full rounded-xl overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 p-6 flex flex-col">
        <CardHeading title="Quote Generator" />

        <motion.div
          className="flex-1 flex flex-col gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: false }}
        >
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Personality Traits</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                Compassionate
              </span>
              <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                Adventurous
              </span>
              <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                Thoughtful
              </span>
              <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                Creative
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <motion.div
              className="bg-muted/30 p-4 rounded-lg"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              viewport={{ once: false }}
            >
              <p className="italic text-sm">
                "The life of the dead is placed in the memory of the living."
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                — Marcus Tullius Cicero
              </p>
            </motion.div>

            <motion.div
              className="bg-muted/30 p-4 rounded-lg"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              viewport={{ once: false }}
            >
              <p className="italic text-sm">
                "What we have once enjoyed we can never lose; all that we love
                deeply becomes a part of us."
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                — Helen Keller
              </p>
            </motion.div>

            <motion.div
              className="bg-muted/30 p-4 rounded-lg"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              viewport={{ once: false }}
            >
              <p className="italic text-sm">
                "To live in hearts we leave behind is not to die."
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                — Thomas Campbell
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}