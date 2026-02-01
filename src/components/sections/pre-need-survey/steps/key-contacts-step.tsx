"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SurveyFormData } from "../survey-form";

interface KeyContactsStepProps {
  data: SurveyFormData;
  onChange: (updates: Partial<SurveyFormData>) => void;
}

export function KeyContactsStep({ data, onChange }: KeyContactsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Key People to Contact
        </h3>
        <p className="text-sm text-muted-foreground">
          People your family should know about and reach out to
        </p>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">
          Emergency Contact (someone who might not be obvious to family)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <AnimatedInput
            label="Name"
            name="emergencyContactName"
            controlled={true}
            value={data.emergencyContactName || ""}
            onChange={(e) =>
              onChange({ emergencyContactName: e.target.value })
            }
            placeholder="Contact's full name"
          />

          <AnimatedInput
            label="Relationship"
            name="emergencyContactRelationship"
            controlled={true}
            value={data.emergencyContactRelationship || ""}
            onChange={(e) =>
              onChange({ emergencyContactRelationship: e.target.value })
            }
            placeholder="e.g., Neighbor, Best Friend"
          />

          <AnimatedInput
            label="Phone"
            name="emergencyContactPhone"
            controlled={true}
            value={data.emergencyContactPhone || ""}
            onChange={(e) =>
              onChange({ emergencyContactPhone: e.target.value })
            }
            placeholder="Phone number"
          />

          <AnimatedInput
            label="Notes"
            name="emergencyContactNotes"
            controlled={true}
            value={data.emergencyContactNotes || ""}
            onChange={(e) =>
              onChange({ emergencyContactNotes: e.target.value })
            }
            placeholder="e.g., has spare key, knows medical history"
          />
        </div>
      </div>

      {/* Professional Advisors */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Professional Advisors</h4>

        {/* Attorney */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAttorney"
              checked={data.hasAttorney || false}
              onCheckedChange={(checked) =>
                onChange({
                  hasAttorney: checked as boolean,
                  ...(checked
                    ? {}
                    : { attorneyName: undefined, attorneyPhone: undefined }),
                })
              }
            />
            <Label htmlFor="hasAttorney" className="text-sm font-medium">
              Do you have an attorney?
            </Label>
          </div>

          {data.hasAttorney && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
              <AnimatedInput
                label="Attorney Name"
                name="attorneyName"
                controlled={true}
                value={data.attorneyName || ""}
                onChange={(e) => onChange({ attorneyName: e.target.value })}
                placeholder="Attorney's name"
              />

              <AnimatedInput
                label="Attorney Phone"
                name="attorneyPhone"
                controlled={true}
                value={data.attorneyPhone || ""}
                onChange={(e) => onChange({ attorneyPhone: e.target.value })}
                placeholder="Attorney's phone"
              />
            </div>
          )}
        </div>

        {/* Financial Advisor */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasFinancialAdvisor"
              checked={data.hasFinancialAdvisor || false}
              onCheckedChange={(checked) =>
                onChange({
                  hasFinancialAdvisor: checked as boolean,
                  ...(checked
                    ? {}
                    : {
                        financialAdvisorName: undefined,
                        financialAdvisorPhone: undefined,
                      }),
                })
              }
            />
            <Label htmlFor="hasFinancialAdvisor" className="text-sm font-medium">
              Do you have a financial advisor or accountant?
            </Label>
          </div>

          {data.hasFinancialAdvisor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
              <AnimatedInput
                label="Advisor Name"
                name="financialAdvisorName"
                controlled={true}
                value={data.financialAdvisorName || ""}
                onChange={(e) =>
                  onChange({ financialAdvisorName: e.target.value })
                }
                placeholder="Advisor's name"
              />

              <AnimatedInput
                label="Advisor Phone"
                name="financialAdvisorPhone"
                controlled={true}
                value={data.financialAdvisorPhone || ""}
                onChange={(e) =>
                  onChange({ financialAdvisorPhone: e.target.value })
                }
                placeholder="Advisor's phone"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
