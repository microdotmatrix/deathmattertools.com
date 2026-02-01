"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SurveyFormData } from "../survey-form";

interface BasicAccessStepProps {
  data: SurveyFormData;
  onChange: (updates: Partial<SurveyFormData>) => void;
}

export function BasicAccessStep({ data, onChange }: BasicAccessStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Basic Access Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Help your loved ones access important information if something happens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <AnimatedInput
          label="Full Name"
          name="fullName"
          controlled={true}
          value={data.fullName || ""}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Enter full legal name"
        />

        <AnimatedInput
          label="Preferred Name"
          name="preferredName"
          controlled={true}
          value={data.preferredName || ""}
          onChange={(e) => onChange({ preferredName: e.target.value })}
          placeholder="e.g., Bobby, Liz, Coach"
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="needsAccessCodes"
            checked={data.needsAccessCodes || false}
            onCheckedChange={(checked) =>
              onChange({ needsAccessCodes: checked as boolean })
            }
          />
          <Label
            htmlFor="needsAccessCodes"
            className="text-sm font-medium leading-none"
          >
            Do your loved ones need any codes or passwords to access important
            information?
          </Label>
        </div>

        {data.needsAccessCodes && (
          <div className="space-y-6 mt-4 pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Phone/Device Hint"
              name="phoneDeviceHint"
              controlled={true}
              value={data.phoneDeviceHint || ""}
              onChange={(e) => onChange({ phoneDeviceHint: e.target.value })}
              placeholder="e.g., mom's birthday"
            />

            <AnimatedInput
              label="Password Manager/Safe Hint"
              name="passwordManagerHint"
              controlled={true}
              value={data.passwordManagerHint || ""}
              onChange={(e) =>
                onChange({ passwordManagerHint: e.target.value })
              }
              placeholder="e.g., our anniversary"
            />

            <AnimatedInput
              label="Where to Find Full Details"
              name="accessDetailsLocation"
              controlled={true}
              value={data.accessDetailsLocation || ""}
              onChange={(e) =>
                onChange({ accessDetailsLocation: e.target.value })
              }
              placeholder="e.g., in the safe, with attorney"
            />
          </div>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Focus on where to find information rather than
          sharing sensitive details directly. Use hints that only trusted family
          members would understand.
        </p>
      </div>
    </div>
  );
}
