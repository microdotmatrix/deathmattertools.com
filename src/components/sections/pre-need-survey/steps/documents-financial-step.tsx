"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SurveyFormData } from "../survey-form";

interface DocumentsFinancialStepProps {
  data: SurveyFormData;
  onChange: (updates: Partial<SurveyFormData>) => void;
}

export function DocumentsFinancialStep({
  data,
  onChange,
}: DocumentsFinancialStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Important Documents & Financial Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Help your family locate essential documents and accounts
        </p>
      </div>

      {/* Will Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Will & Legal Documents</h4>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="min-w-[120px]">Do you have a Will?</Label>
            <Select
              value={data.hasWill || ""}
              onValueChange={(value: "yes" | "no" | "unsure") =>
                onChange({ hasWill: value })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="unsure">Unsure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.hasWill === "yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
              <AnimatedInput
                label="Where is it stored?"
                name="willLocation"
                controlled={true}
                value={data.willLocation || ""}
                onChange={(e) => onChange({ willLocation: e.target.value })}
                placeholder="e.g., safe deposit box, with attorney"
              />

              <AnimatedInput
                label="Attorney's name (if applicable)"
                name="willAttorneyName"
                controlled={true}
                value={data.willAttorneyName || ""}
                onChange={(e) => onChange({ willAttorneyName: e.target.value })}
                placeholder="Attorney name"
              />
            </div>
          )}
        </div>

        {/* Legal Documents Checklist */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-medium">
            Do you have any of these documents? (Check all that apply)
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPowerOfAttorneyFinancial"
                checked={data.hasPowerOfAttorneyFinancial || false}
                onCheckedChange={(checked) =>
                  onChange({ hasPowerOfAttorneyFinancial: checked as boolean })
                }
              />
              <Label htmlFor="hasPowerOfAttorneyFinancial" className="text-sm">
                Power of Attorney (Financial)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPowerOfAttorneyHealthcare"
                checked={data.hasPowerOfAttorneyHealthcare || false}
                onCheckedChange={(checked) =>
                  onChange({ hasPowerOfAttorneyHealthcare: checked as boolean })
                }
              />
              <Label htmlFor="hasPowerOfAttorneyHealthcare" className="text-sm">
                Power of Attorney (Healthcare)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasLivingWill"
                checked={data.hasLivingWill || false}
                onCheckedChange={(checked) =>
                  onChange({ hasLivingWill: checked as boolean })
                }
              />
              <Label htmlFor="hasLivingWill" className="text-sm">
                Living Will / Advance Directive
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasHealthCareProxy"
                checked={data.hasHealthCareProxy || false}
                onCheckedChange={(checked) =>
                  onChange({ hasHealthCareProxy: checked as boolean })
                }
              />
              <Label htmlFor="hasHealthCareProxy" className="text-sm">
                Health Care Proxy
              </Label>
            </div>
          </div>

          {(data.hasPowerOfAttorneyFinancial ||
            data.hasPowerOfAttorneyHealthcare ||
            data.hasLivingWill ||
            data.hasHealthCareProxy) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mt-4 pl-6 border-l-2 border-muted">
              <AnimatedInput
                label="Designated Person's Name"
                name="legalDocsDesignatedPerson"
                controlled={true}
                value={data.legalDocsDesignatedPerson || ""}
                onChange={(e) =>
                  onChange({ legalDocsDesignatedPerson: e.target.value })
                }
                placeholder="Person designated in documents"
              />

              <AnimatedInput
                label="Their Phone Number"
                name="legalDocsDesignatedPhone"
                controlled={true}
                value={data.legalDocsDesignatedPhone || ""}
                onChange={(e) =>
                  onChange({ legalDocsDesignatedPhone: e.target.value })
                }
                placeholder="Phone number"
              />

              <div className="md:col-span-2">
                <AnimatedInput
                  label="Where are documents stored?"
                  name="legalDocsLocation"
                  controlled={true}
                  value={data.legalDocsLocation || ""}
                  onChange={(e) =>
                    onChange({ legalDocsLocation: e.target.value })
                  }
                  placeholder="Location of these documents"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Financial Information</h4>

        {/* End of Life Funding */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasEndOfLifeFunding"
            checked={data.hasEndOfLifeFunding || false}
            onCheckedChange={(checked) =>
              onChange({ hasEndOfLifeFunding: checked as boolean })
            }
          />
          <Label htmlFor="hasEndOfLifeFunding" className="text-sm font-medium">
            Have you set aside money for end-of-life expenses?
          </Label>
        </div>

        {data.hasEndOfLifeFunding && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Where is it located?"
              name="fundingLocation"
              controlled={true}
              value={data.fundingLocation || ""}
              onChange={(e) => onChange({ fundingLocation: e.target.value })}
              placeholder="e.g., savings account at XYZ Bank"
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPreneedPlan"
                checked={data.isPreneedPlan || false}
                onCheckedChange={(checked) =>
                  onChange({ isPreneedPlan: checked as boolean })
                }
              />
              <Label htmlFor="isPreneedPlan" className="text-sm">
                Is it a pre-need funeral plan?
              </Label>
            </div>
          </div>
        )}

        {/* Life Insurance */}
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="hasLifeInsurance"
            checked={data.hasLifeInsurance || false}
            onCheckedChange={(checked) =>
              onChange({ hasLifeInsurance: checked as boolean })
            }
          />
          <Label htmlFor="hasLifeInsurance" className="text-sm font-medium">
            Do you have life insurance?
          </Label>
        </div>

        {data.hasLifeInsurance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Company Name"
              name="lifeInsuranceCompany"
              controlled={true}
              value={data.lifeInsuranceCompany || ""}
              onChange={(e) =>
                onChange({ lifeInsuranceCompany: e.target.value })
              }
              placeholder="Insurance company"
            />

            <AnimatedInput
              label="Where is the policy?"
              name="lifeInsurancePolicyLocation"
              controlled={true}
              value={data.lifeInsurancePolicyLocation || ""}
              onChange={(e) =>
                onChange({ lifeInsurancePolicyLocation: e.target.value })
              }
              placeholder="Policy location"
            />

            <AnimatedInput
              label="Beneficiary"
              name="lifeInsuranceBeneficiary"
              controlled={true}
              value={data.lifeInsuranceBeneficiary || ""}
              onChange={(e) =>
                onChange({ lifeInsuranceBeneficiary: e.target.value })
              }
              placeholder="Named beneficiary"
            />
          </div>
        )}

        {/* Banking & Investments */}
        <div className="space-y-4 pt-4">
          <Label className="text-sm font-medium">
            Where do you bank and invest? (Institution names only)
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <AnimatedInput
              label="Banks/Credit Unions"
              name="banksCreditUnions"
              controlled={true}
              value={data.banksCreditUnions || ""}
              onChange={(e) => onChange({ banksCreditUnions: e.target.value })}
              placeholder="e.g., Chase, Local Credit Union"
            />

            <AnimatedInput
              label="Investment/Retirement Accounts"
              name="investmentAccounts"
              controlled={true}
              value={data.investmentAccounts || ""}
              onChange={(e) =>
                onChange({ investmentAccounts: e.target.value })
              }
              placeholder="e.g., Fidelity, Vanguard 401k"
            />

            <AnimatedInput
              label="Other (crypto, etc.)"
              name="otherFinancialAccounts"
              controlled={true}
              value={data.otherFinancialAccounts || ""}
              onChange={(e) =>
                onChange({ otherFinancialAccounts: e.target.value })
              }
              placeholder="Any other financial accounts"
            />

            <AnimatedInput
              label="Where to find account details"
              name="accountDetailsLocation"
              controlled={true}
              value={data.accountDetailsLocation || ""}
              onChange={(e) =>
                onChange({ accountDetailsLocation: e.target.value })
              }
              placeholder="Location of account information"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
