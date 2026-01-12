"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type TemplateKey = "bookmark" | "prayerCard" | "singlePageMemorial" | "thankyouCard";

export interface TemplateOption {
  key: TemplateKey;
  title: string;
  description: string;
}

export const templateOptions: TemplateOption[] = [
  {
    key: "bookmark",
    title: "Bookmark",
    description: "A memorial bookmark with portrait, name, dates, and epitaph.",
  },
  {
    key: "prayerCard",
    title: "Prayer Card",
    description:
      "Front and back prayer card with portrait, epitaph, service details, and prayer.",
  },
  {
    key: "singlePageMemorial",
    title: "Single Page Memorial",
    description:
      "A full memorial page with obituary summary and service details.",
  },
  {
    key: "thankyouCard",
    title: "Thank You Card",
    description:
      "A thank you card with personalized message and sign-off from the family.",
  },
];

interface TemplateSelectorProps {
  selectedTemplate: TemplateKey;
  onTemplateChange: (template: TemplateKey) => void;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Select Template</Label>
      <RadioGroup
        value={selectedTemplate}
        onValueChange={(value) => onTemplateChange(value as TemplateKey)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {templateOptions.map((option) => (
          <Label
            key={option.key}
            htmlFor={option.key}
            className="cursor-pointer"
          >
            <Card
              className={cn(
                "relative transition-all hover:border-primary/50 py-3",
                selectedTemplate === option.key &&
                  "border-primary ring-2 ring-primary/20",
              )}
            >
              <CardContent className="flex items-start gap-3 p-0 px-4">
                <RadioGroupItem
                  value={option.key}
                  id={option.key}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <CardTitle className="text-sm">{option.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {option.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
