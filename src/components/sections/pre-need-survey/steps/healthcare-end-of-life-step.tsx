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

interface HealthcareEndOfLifeStepProps {
  data: SurveyFormData;
  onChange: (updates: Partial<SurveyFormData>) => void;
}

export function HealthcareEndOfLifeStep({
  data,
  onChange,
}: HealthcareEndOfLifeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Healthcare & End-of-Life Preferences
        </h3>
        <p className="text-sm text-muted-foreground">
          Medical information and your wishes for end-of-life arrangements
        </p>
      </div>

      {/* Healthcare Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Healthcare Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <AnimatedInput
            label="Primary Doctor's Name"
            name="primaryDoctorName"
            controlled={true}
            value={data.primaryDoctorName || ""}
            onChange={(e) => onChange({ primaryDoctorName: e.target.value })}
            placeholder="Doctor's name"
          />

          <AnimatedInput
            label="Doctor's Phone"
            name="primaryDoctorPhone"
            controlled={true}
            value={data.primaryDoctorPhone || ""}
            onChange={(e) => onChange({ primaryDoctorPhone: e.target.value })}
            placeholder="Phone number"
          />
        </div>

        <AnimatedInput
          label="Critical Medications"
          name="criticalMedications"
          type="textarea"
          controlled={true}
          value={data.criticalMedications || ""}
          onChange={(e) => onChange({ criticalMedications: e.target.value })}
          placeholder="List any critical medications"
          className="h-20"
        />

        <AnimatedInput
          label="Major Health Conditions"
          name="majorHealthConditions"
          type="textarea"
          controlled={true}
          value={data.majorHealthConditions || ""}
          onChange={(e) => onChange({ majorHealthConditions: e.target.value })}
          placeholder="Conditions that family/medical staff should know about"
          className="h-20"
        />

        <AnimatedInput
          label="Preferred Hospital"
          name="preferredHospital"
          controlled={true}
          value={data.preferredHospital || ""}
          onChange={(e) => onChange({ preferredHospital: e.target.value })}
          placeholder="Hospital name and location"
        />

        <div className="flex items-center gap-4 pt-4">
          <Label className="min-w-[180px]">Organ Donation Preference:</Label>
          <Select
            value={data.organDonationPreference || ""}
            onValueChange={(value: "yes" | "no" | "family_decides") =>
              onChange({ organDonationPreference: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes, I want to donate</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="family_decides">Family decides</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* End-of-Life Section */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-medium text-foreground">End-of-Life Preferences</h4>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasFuneralArrangements"
            checked={data.hasFuneralArrangements || false}
            onCheckedChange={(checked) =>
              onChange({ hasFuneralArrangements: checked as boolean })
            }
          />
          <Label htmlFor="hasFuneralArrangements" className="text-sm font-medium">
            Have you already made funeral/memorial arrangements?
          </Label>
        </div>

        {data.hasFuneralArrangements && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pl-6 border-l-2 border-muted">
            <AnimatedInput
              label="Funeral Home/Provider"
              name="funeralHomeProvider"
              controlled={true}
              value={data.funeralHomeProvider || ""}
              onChange={(e) =>
                onChange({ funeralHomeProvider: e.target.value })
              }
              placeholder="Name of funeral home"
            />

            <AnimatedInput
              label="Where is the paperwork?"
              name="arrangementPaperworkLocation"
              controlled={true}
              value={data.arrangementPaperworkLocation || ""}
              onChange={(e) =>
                onChange({ arrangementPaperworkLocation: e.target.value })
              }
              placeholder="Location of arrangements documentation"
            />
          </div>
        )}

        {/* Service Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type of Service Preferred:</Label>
            <Select
              value={data.serviceTypePreference || ""}
              onValueChange={(
                value:
                  | "funeral"
                  | "memorial"
                  | "celebration"
                  | "private"
                  | "no_preference"
              ) => onChange({ serviceTypePreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preference..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funeral">Traditional Funeral</SelectItem>
                <SelectItem value="memorial">Memorial Service</SelectItem>
                <SelectItem value="celebration">Celebration of Life</SelectItem>
                <SelectItem value="private">Private/Family Only</SelectItem>
                <SelectItem value="no_preference">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Final Arrangement Preference:</Label>
            <Select
              value={data.finalArrangementPreference || ""}
              onValueChange={(
                value: "burial" | "cremation" | "green_burial" | "no_preference"
              ) => onChange({ finalArrangementPreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preference..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="burial">Traditional Burial</SelectItem>
                <SelectItem value="cremation">Cremation</SelectItem>
                <SelectItem value="green_burial">Green/Natural Burial</SelectItem>
                <SelectItem value="no_preference">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatedInput
          label="Religious/Spiritual Notes"
          name="religiousSpiritualNotes"
          type="textarea"
          controlled={true}
          value={data.religiousSpiritualNotes || ""}
          onChange={(e) => onChange({ religiousSpiritualNotes: e.target.value })}
          placeholder="Any religious or spiritual preferences for the service"
          className="h-20"
        />

        <AnimatedInput
          label="Key Points for Obituary"
          name="obituaryKeyPoints"
          type="textarea"
          controlled={true}
          value={data.obituaryKeyPoints || ""}
          onChange={(e) => onChange({ obituaryKeyPoints: e.target.value })}
          placeholder="Things you'd like mentioned - accomplishments, passions, stories"
          className="h-24"
        />

        <AnimatedInput
          label="Preferred Charities (in lieu of flowers)"
          name="preferredCharities"
          type="textarea"
          controlled={true}
          value={data.preferredCharities || ""}
          onChange={(e) => onChange({ preferredCharities: e.target.value })}
          placeholder="Charities to suggest for memorial donations"
          className="h-20"
        />
      </div>
    </div>
  );
}
