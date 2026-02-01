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

interface PropertyDigitalStepProps {
  data: SurveyFormData;
  onChange: (updates: Partial<SurveyFormData>) => void;
}

export function PropertyDigitalStep({
  data,
  onChange,
}: PropertyDigitalStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Property, Assets & Digital Life
        </h3>
        <p className="text-sm text-muted-foreground">
          Information about your property, belongings, and digital accounts
        </p>
      </div>

      {/* Property Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Property & Assets</h4>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ownsOrRentsProperty"
            checked={data.ownsOrRentsProperty || false}
            onCheckedChange={(checked) =>
              onChange({ ownsOrRentsProperty: checked as boolean })
            }
          />
          <Label htmlFor="ownsOrRentsProperty" className="text-sm font-medium">
            Do you own or rent property?
          </Label>
        </div>

        {data.ownsOrRentsProperty && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Address"
              name="propertyAddress"
              controlled={true}
              value={data.propertyAddress || ""}
              onChange={(e) => onChange({ propertyAddress: e.target.value })}
              placeholder="Property address"
            />

            <div className="flex items-center gap-4">
              <Label className="min-w-[80px]">Status:</Label>
              <Select
                value={data.propertyStatus || ""}
                onValueChange={(value: "own" | "rent" | "lease") =>
                  onChange({ propertyStatus: value })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own">Own</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatedInput
              label="Important Contacts"
              name="propertyContacts"
              controlled={true}
              value={data.propertyContacts || ""}
              onChange={(e) => onChange({ propertyContacts: e.target.value })}
              placeholder="e.g., mortgage lender, landlord"
            />

            <AnimatedInput
              label="Where are property documents?"
              name="propertyDocsLocation"
              controlled={true}
              value={data.propertyDocsLocation || ""}
              onChange={(e) =>
                onChange({ propertyDocsLocation: e.target.value })
              }
              placeholder="Location of deed, lease, etc."
            />
          </div>
        )}

        {/* Other Assets */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-medium">
            Do you have any of these? (Check all that apply)
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasStorageUnit"
                checked={data.hasStorageUnit || false}
                onCheckedChange={(checked) =>
                  onChange({ hasStorageUnit: checked as boolean })
                }
              />
              <Label htmlFor="hasStorageUnit" className="text-sm">
                Storage unit
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSafeDepositBox"
                checked={data.hasSafeDepositBox || false}
                onCheckedChange={(checked) =>
                  onChange({ hasSafeDepositBox: checked as boolean })
                }
              />
              <Label htmlFor="hasSafeDepositBox" className="text-sm">
                Safe deposit box
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPOBox"
                checked={data.hasPOBox || false}
                onCheckedChange={(checked) =>
                  onChange({ hasPOBox: checked as boolean })
                }
              />
              <Label htmlFor="hasPOBox" className="text-sm">
                PO Box
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasVehicles"
                checked={data.hasVehicles || false}
                onCheckedChange={(checked) =>
                  onChange({ hasVehicles: checked as boolean })
                }
              />
              <Label htmlFor="hasVehicles" className="text-sm">
                Vehicles (owned/leased)
              </Label>
            </div>
          </div>

          {(data.hasStorageUnit ||
            data.hasSafeDepositBox ||
            data.hasPOBox ||
            data.hasVehicles) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mt-4 pl-6 border-l-2 border-muted">
              <AnimatedInput
                label="Location/Details"
                name="otherAssetsDetails"
                type="textarea"
                controlled={true}
                value={data.otherAssetsDetails || ""}
                onChange={(e) =>
                  onChange({ otherAssetsDetails: e.target.value })
                }
                placeholder="Details about these items"
                className="h-20"
              />

              <AnimatedInput
                label="Where are keys/access info?"
                name="otherAssetsAccessInfo"
                controlled={true}
                value={data.otherAssetsAccessInfo || ""}
                onChange={(e) =>
                  onChange({ otherAssetsAccessInfo: e.target.value })
                }
                placeholder="Location of keys, codes, etc."
              />
            </div>
          )}
        </div>
      </div>

      {/* Digital Life Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Digital Life</h4>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="usesPasswordManager"
            checked={data.usesPasswordManager || false}
            onCheckedChange={(checked) =>
              onChange({ usesPasswordManager: checked as boolean })
            }
          />
          <Label htmlFor="usesPasswordManager" className="text-sm font-medium">
            Do you use a password manager?
          </Label>
        </div>

        {data.usesPasswordManager && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Which one?"
              name="passwordManagerName"
              controlled={true}
              value={data.passwordManagerName || ""}
              onChange={(e) =>
                onChange({ passwordManagerName: e.target.value })
              }
              placeholder="e.g., LastPass, 1Password"
            />

            <AnimatedInput
              label="Where to find master password"
              name="masterPasswordLocation"
              controlled={true}
              value={data.masterPasswordLocation || ""}
              onChange={(e) =>
                onChange({ masterPasswordLocation: e.target.value })
              }
              placeholder="Hint or location"
            />
          </div>
        )}

        {/* Online Accounts */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-medium">
            Important online accounts (check main categories)
          </Label>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEmailAccounts"
                checked={data.hasEmailAccounts || false}
                onCheckedChange={(checked) =>
                  onChange({ hasEmailAccounts: checked as boolean })
                }
              />
              <Label htmlFor="hasEmailAccounts" className="text-sm">
                Email accounts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSocialMedia"
                checked={data.hasSocialMedia || false}
                onCheckedChange={(checked) =>
                  onChange({ hasSocialMedia: checked as boolean })
                }
              />
              <Label htmlFor="hasSocialMedia" className="text-sm">
                Social media
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasBankingApps"
                checked={data.hasBankingApps || false}
                onCheckedChange={(checked) =>
                  onChange({ hasBankingApps: checked as boolean })
                }
              />
              <Label htmlFor="hasBankingApps" className="text-sm">
                Banking/Financial apps
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasStreamingSubscriptions"
                checked={data.hasStreamingSubscriptions || false}
                onCheckedChange={(checked) =>
                  onChange({ hasStreamingSubscriptions: checked as boolean })
                }
              />
              <Label htmlFor="hasStreamingSubscriptions" className="text-sm">
                Streaming/Subscriptions
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasWorkAccounts"
                checked={data.hasWorkAccounts || false}
                onCheckedChange={(checked) =>
                  onChange({ hasWorkAccounts: checked as boolean })
                }
              />
              <Label htmlFor="hasWorkAccounts" className="text-sm">
                Work accounts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCloudStorage"
                checked={data.hasCloudStorage || false}
                onCheckedChange={(checked) =>
                  onChange({ hasCloudStorage: checked as boolean })
                }
              />
              <Label htmlFor="hasCloudStorage" className="text-sm">
                Cloud storage
              </Label>
            </div>
          </div>

          <AnimatedInput
            label="Where can login information be found?"
            name="loginInfoLocation"
            controlled={true}
            value={data.loginInfoLocation || ""}
            onChange={(e) => onChange({ loginInfoLocation: e.target.value })}
            placeholder="e.g., password manager, notebook in safe"
          />
        </div>

        {/* Digital Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pt-4">
          <AnimatedInput
            label="Accounts to delete"
            name="accountsToDelete"
            type="textarea"
            controlled={true}
            value={data.accountsToDelete || ""}
            onChange={(e) => onChange({ accountsToDelete: e.target.value })}
            placeholder="Accounts you want closed/deleted"
            className="h-20"
          />

          <AnimatedInput
            label="Accounts to memorialize"
            name="accountsToMemorialize"
            type="textarea"
            controlled={true}
            value={data.accountsToMemorialize || ""}
            onChange={(e) => onChange({ accountsToMemorialize: e.target.value })}
            placeholder="Accounts to keep as memorials (e.g., Facebook)"
            className="h-20"
          />
        </div>
      </div>

      {/* Ongoing Responsibilities */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Ongoing Responsibilities</h4>

        <Label className="text-sm font-medium">
          Regular payments that need attention (check all that apply)
        </Label>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasUtilityPayments"
              checked={data.hasUtilityPayments || false}
              onCheckedChange={(checked) =>
                onChange({ hasUtilityPayments: checked as boolean })
              }
            />
            <Label htmlFor="hasUtilityPayments" className="text-sm">
              Utilities (electric, gas, water, internet)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSubscriptionPayments"
              checked={data.hasSubscriptionPayments || false}
              onCheckedChange={(checked) =>
                onChange({ hasSubscriptionPayments: checked as boolean })
              }
            />
            <Label htmlFor="hasSubscriptionPayments" className="text-sm">
              Subscriptions (streaming, gym, etc.)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasInsurancePayments"
              checked={data.hasInsurancePayments || false}
              onCheckedChange={(checked) =>
                onChange({ hasInsurancePayments: checked as boolean })
              }
            />
            <Label htmlFor="hasInsurancePayments" className="text-sm">
              Insurance payments
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCharitableDonations"
              checked={data.hasCharitableDonations || false}
              onCheckedChange={(checked) =>
                onChange({ hasCharitableDonations: checked as boolean })
              }
            />
            <Label htmlFor="hasCharitableDonations" className="text-sm">
              Regular charitable donations
            </Label>
          </div>
        </div>

        <AnimatedInput
          label="How are these typically paid?"
          name="paymentMethod"
          controlled={true}
          value={data.paymentMethod || ""}
          onChange={(e) => onChange({ paymentMethod: e.target.value })}
          placeholder="e.g., auto-pay from checking account"
        />
      </div>
    </div>
  );
}
