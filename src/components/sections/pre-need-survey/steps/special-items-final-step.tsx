"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SurveyFormData } from "../survey-form";

interface SpecialItemsFinalStepProps {
  data: SurveyFormData;
  onChange: (updates: Partial<SurveyFormData>) => void;
}

export function SpecialItemsFinalStep({
  data,
  onChange,
}: SpecialItemsFinalStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Special Items & Final Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Important items, people to notify, and backup information
        </p>
      </div>

      {/* Special Items Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Special Items & Bequests</h4>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasSpecificItemsForPeople"
            checked={data.hasSpecificItemsForPeople || false}
            onCheckedChange={(checked) =>
              onChange({ hasSpecificItemsForPeople: checked as boolean })
            }
          />
          <Label
            htmlFor="hasSpecificItemsForPeople"
            className="text-sm font-medium"
          >
            Do you have specific items you want to go to specific people?
          </Label>
        </div>

        {data.hasSpecificItemsForPeople && (
          <div className="pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Where is this documented?"
              name="specificItemsDocLocation"
              controlled={true}
              value={data.specificItemsDocLocation || ""}
              onChange={(e) =>
                onChange({ specificItemsDocLocation: e.target.value })
              }
              placeholder="e.g., with the will, in a separate letter, in the safe"
            />
          </div>
        )}
      </div>

      {/* People to Notify Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">
          People to Notify (who may not be obvious)
        </h4>
        <p className="text-sm text-muted-foreground">
          Friends, colleagues, or others your family might not think to contact
        </p>

        {/* Person 1 */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Person 1</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
            <AnimatedInput
              label="Name"
              name="personToNotify1Name"
              controlled={true}
              value={data.personToNotify1Name || ""}
              onChange={(e) =>
                onChange({ personToNotify1Name: e.target.value })
              }
              placeholder="Full name"
            />

            <AnimatedInput
              label="Relationship"
              name="personToNotify1Relationship"
              controlled={true}
              value={data.personToNotify1Relationship || ""}
              onChange={(e) =>
                onChange({ personToNotify1Relationship: e.target.value })
              }
              placeholder="e.g., College roommate"
            />

            <AnimatedInput
              label="Contact Info"
              name="personToNotify1Contact"
              controlled={true}
              value={data.personToNotify1Contact || ""}
              onChange={(e) =>
                onChange({ personToNotify1Contact: e.target.value })
              }
              placeholder="Phone or email"
            />
          </div>
        </div>

        {/* Person 2 */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Person 2</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
            <AnimatedInput
              label="Name"
              name="personToNotify2Name"
              controlled={true}
              value={data.personToNotify2Name || ""}
              onChange={(e) =>
                onChange({ personToNotify2Name: e.target.value })
              }
              placeholder="Full name"
            />

            <AnimatedInput
              label="Relationship"
              name="personToNotify2Relationship"
              controlled={true}
              value={data.personToNotify2Relationship || ""}
              onChange={(e) =>
                onChange({ personToNotify2Relationship: e.target.value })
              }
              placeholder="e.g., Work mentor"
            />

            <AnimatedInput
              label="Contact Info"
              name="personToNotify2Contact"
              controlled={true}
              value={data.personToNotify2Contact || ""}
              onChange={(e) =>
                onChange({ personToNotify2Contact: e.target.value })
              }
              placeholder="Phone or email"
            />
          </div>
        </div>
      </div>

      {/* Employer Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Employment Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <AnimatedInput
            label="Current Employer"
            name="employerName"
            controlled={true}
            value={data.employerName || ""}
            onChange={(e) => onChange({ employerName: e.target.value })}
            placeholder="Company name (if employed)"
          />

          <AnimatedInput
            label="HR/Benefits Contact"
            name="hrBenefitsContact"
            controlled={true}
            value={data.hrBenefitsContact || ""}
            onChange={(e) => onChange({ hrBenefitsContact: e.target.value })}
            placeholder="For benefits, pension, etc."
          />
        </div>
      </div>

      {/* Physical Access Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Physical Access</h4>
        <p className="text-sm text-muted-foreground">
          Help your family access important locations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <AnimatedInput
            label="Where are spare house keys?"
            name="spareKeysLocation"
            controlled={true}
            value={data.spareKeysLocation || ""}
            onChange={(e) => onChange({ spareKeysLocation: e.target.value })}
            placeholder="e.g., under planter, with neighbor Sue"
          />

          <AnimatedInput
            label="Where are car keys?"
            name="carKeysLocation"
            controlled={true}
            value={data.carKeysLocation || ""}
            onChange={(e) => onChange({ carKeysLocation: e.target.value })}
            placeholder="Location of all car keys"
          />

          <div className="md:col-span-2">
            <AnimatedInput
              label="Safe/Security Code Hint"
              name="safeSecurityCodeHint"
              controlled={true}
              value={data.safeSecurityCodeHint || ""}
              onChange={(e) =>
                onChange({ safeSecurityCodeHint: e.target.value })
              }
              placeholder="A hint only trusted family would understand"
            />
          </div>
        </div>
      </div>

      {/* Backup Information Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Backup Contacts & Information</h4>
        <p className="text-sm text-muted-foreground">
          Who has copies of this information?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <AnimatedInput
            label="Backup Person 1"
            name="backupPerson1"
            controlled={true}
            value={data.backupPerson1 || ""}
            onChange={(e) => onChange({ backupPerson1: e.target.value })}
            placeholder="Name and relationship"
          />

          <AnimatedInput
            label="Backup Person 2"
            name="backupPerson2"
            controlled={true}
            value={data.backupPerson2 || ""}
            onChange={(e) => onChange({ backupPerson2: e.target.value })}
            placeholder="Name and relationship"
          />

          <div className="md:col-span-2">
            <AnimatedInput
              label="Where is backup copy stored?"
              name="backupLocation"
              controlled={true}
              value={data.backupLocation || ""}
              onChange={(e) => onChange({ backupLocation: e.target.value })}
              placeholder="e.g., attorney's office, safe deposit box"
            />
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">Anything Else?</h4>

        <AnimatedInput
          label="Additional Information"
          name="additionalInformation"
          type="textarea"
          controlled={true}
          value={data.additionalInformation || ""}
          onChange={(e) => onChange({ additionalInformation: e.target.value })}
          placeholder="Any other important information your family should know..."
          className="h-32"
        />
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <p className="text-sm text-muted-foreground">
          <strong>You're almost done!</strong> Click "Complete Survey" below to
          submit your responses. You can always come back and update your
          answers until the owner locks the survey.
        </p>
      </div>
    </div>
  );
}
