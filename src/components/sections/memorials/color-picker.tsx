"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

const presetColors = [
  "#000000",
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#2c3e50",
  "#34495e",
  "#4a4a4a",
  "#6b5b95",
  "#2e4a62",
  "#1e3a5f",
  "#3d5a80",
  "#4a5568",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({
  value,
  onChange,
  label = "Overlay Color",
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value || "#000000");

  const handlePresetClick = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(color);
    if (isValidHex) {
      onChange(color);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            type="button"
          >
            <div
              className="size-5 rounded border border-border"
              style={{ backgroundColor: value || "#000000" }}
            />
            <span className="text-muted-foreground">
              {value || "Select color"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "size-8 rounded-md border-2 transition-all hover:scale-110",
                    value === color
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customColor}
                onChange={handleCustomChange}
                placeholder="#000000"
                className="font-mono text-sm"
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onChange(e.target.value);
                }}
                className="size-9 cursor-pointer rounded border border-input p-0.5"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
