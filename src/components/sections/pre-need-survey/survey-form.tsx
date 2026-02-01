"use client";

import Stepper, { Step } from "@/components/elements/multi-step";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  saveSurveyProgressAction,
  submitSurveyAction,
} from "@/actions/pre-need-survey";
import type { PreNeedSurveyResponse } from "@/lib/db/schema";

// Step Components
import { BasicAccessStep } from "./steps/basic-access-step";
import { KeyContactsStep } from "./steps/key-contacts-step";
import { DocumentsFinancialStep } from "./steps/documents-financial-step";
import { PropertyDigitalStep } from "./steps/property-digital-step";
import { HealthcareEndOfLifeStep } from "./steps/healthcare-end-of-life-step";
import { SpecialItemsFinalStep } from "./steps/special-items-final-step";

export interface SurveyFormData {
  // Section 1: Basic Access
  fullName?: string;
  preferredName?: string;
  needsAccessCodes?: boolean;
  phoneDeviceHint?: string;
  passwordManagerHint?: string;
  accessDetailsLocation?: string;

  // Section 2: Key Contacts
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactNotes?: string;
  hasAttorney?: boolean;
  attorneyName?: string;
  attorneyPhone?: string;
  hasFinancialAdvisor?: boolean;
  financialAdvisorName?: string;
  financialAdvisorPhone?: string;

  // Section 3: Documents
  hasWill?: "yes" | "no" | "unsure";
  willLocation?: string;
  willAttorneyName?: string;
  hasPowerOfAttorneyFinancial?: boolean;
  hasPowerOfAttorneyHealthcare?: boolean;
  hasLivingWill?: boolean;
  hasHealthCareProxy?: boolean;
  legalDocsDesignatedPerson?: string;
  legalDocsDesignatedPhone?: string;
  legalDocsLocation?: string;

  // Section 4: Financial
  hasEndOfLifeFunding?: boolean;
  fundingLocation?: string;
  isPreneedPlan?: boolean;
  hasLifeInsurance?: boolean;
  lifeInsuranceCompany?: string;
  lifeInsurancePolicyLocation?: string;
  lifeInsuranceBeneficiary?: string;
  banksCreditUnions?: string;
  investmentAccounts?: string;
  otherFinancialAccounts?: string;
  accountDetailsLocation?: string;

  // Section 5: Property
  ownsOrRentsProperty?: boolean;
  propertyAddress?: string;
  propertyStatus?: "own" | "rent" | "lease";
  propertyContacts?: string;
  propertyDocsLocation?: string;
  hasStorageUnit?: boolean;
  hasSafeDepositBox?: boolean;
  hasPOBox?: boolean;
  hasVehicles?: boolean;
  otherAssetsDetails?: string;
  otherAssetsAccessInfo?: string;

  // Section 6: Digital Life
  usesPasswordManager?: boolean;
  passwordManagerName?: string;
  masterPasswordLocation?: string;
  hasEmailAccounts?: boolean;
  hasSocialMedia?: boolean;
  hasBankingApps?: boolean;
  hasStreamingSubscriptions?: boolean;
  hasWorkAccounts?: boolean;
  hasCloudStorage?: boolean;
  loginInfoLocation?: string;
  accountsToDelete?: string;
  accountsToMemorialize?: string;

  // Section 7: Ongoing Responsibilities
  hasUtilityPayments?: boolean;
  hasSubscriptionPayments?: boolean;
  hasInsurancePayments?: boolean;
  hasCharitableDonations?: boolean;
  paymentMethod?: string;

  // Section 8: Healthcare
  primaryDoctorName?: string;
  primaryDoctorPhone?: string;
  criticalMedications?: string;
  majorHealthConditions?: string;
  preferredHospital?: string;
  organDonationPreference?: "yes" | "no" | "family_decides";

  // Section 9: End-of-Life
  hasFuneralArrangements?: boolean;
  funeralHomeProvider?: string;
  arrangementPaperworkLocation?: string;
  serviceTypePreference?:
    | "funeral"
    | "memorial"
    | "celebration"
    | "private"
    | "no_preference";
  finalArrangementPreference?:
    | "burial"
    | "cremation"
    | "green_burial"
    | "no_preference";
  religiousSpiritualNotes?: string;
  obituaryKeyPoints?: string;
  preferredCharities?: string;

  // Section 10: Special Items
  hasSpecificItemsForPeople?: boolean;
  specificItemsDocLocation?: string;
  personToNotify1Name?: string;
  personToNotify1Relationship?: string;
  personToNotify1Contact?: string;
  personToNotify2Name?: string;
  personToNotify2Relationship?: string;
  personToNotify2Contact?: string;
  employerName?: string;
  hrBenefitsContact?: string;

  // Section 11: Final Details
  spareKeysLocation?: string;
  carKeysLocation?: string;
  safeSecurityCodeHint?: string;
  additionalInformation?: string;
  backupPerson1?: string;
  backupPerson2?: string;
  backupLocation?: string;
}

interface SurveyFormProps {
  shareToken: string;
  initialData?: PreNeedSurveyResponse | null;
  initialStep?: number;
  isLocked?: boolean;
  subjectName: string;
}

export function SurveyForm({
  shareToken,
  initialData,
  initialStep = 1,
  isLocked = false,
  subjectName,
}: SurveyFormProps) {
  // Convert initial data to form data format
  const processInitialData = (
    data: PreNeedSurveyResponse | null | undefined
  ): SurveyFormData => {
    if (!data) return {};
    // Filter out non-form fields
    const {
      id,
      surveyId,
      isComplete,
      completedAt,
      lastEditedAt,
      createdAt,
      updatedAt,
      ...formFields
    } = data;
    return formFields as SurveyFormData;
  };

  const [formData, setFormData] = useState<SurveyFormData>(
    processInitialData(initialData)
  );
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);

  const updateFormData = (updates: Partial<SurveyFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleStepChange = async (step: number) => {
    // Auto-save when changing steps
    if (!isLocked) {
      await saveProgress(step);
    }
    setCurrentStep(step);
  };

  const saveProgress = async (step?: number) => {
    const formDataObj = new FormData();

    // Add all form data
    for (const [key, value] of Object.entries(formData)) {
      if (value !== undefined && value !== null) {
        formDataObj.append(key, String(value));
      }
    }

    // Add current step
    if (step) {
      formDataObj.append("currentStep", String(step));
    }

    startTransition(async () => {
      const result = await saveSurveyProgressAction(shareToken, {}, formDataObj);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formDataObj = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (value !== undefined && value !== null) {
        formDataObj.append(key, String(value));
      }
    }

    startTransition(async () => {
      const result = await submitSurveyAction(shareToken, {}, formDataObj);
      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        toast.success("Survey submitted successfully!");
        // Redirect or show thank you
        window.location.href = `/survey/${shareToken}/thank-you`;
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProgress(currentStep);
    toast.success("Progress saved!");
  };

  const saveProgressButton = !isLocked ? (
    <Button
      type="button"
      onClick={handleSave}
      disabled={isPending || isSubmitting}
      variant="outline"
    >
      {isPending ? "Saving..." : "Save Progress"}
    </Button>
  ) : null;

  if (isLocked) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2">Survey Locked</h2>
        <p className="text-muted-foreground">
          This survey has been locked by the owner and cannot be edited.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Pre-Need Survey</h1>
        <p className="text-muted-foreground">
          Legacy Navigator for {subjectName}
        </p>
      </div>

      <Stepper
        initialStep={initialStep}
        onStepChange={handleStepChange}
        onFinalStepCompleted={handleSubmit}
        nextButtonProps={{ disabled: isPending || isSubmitting }}
        backButtonProps={{ disabled: isPending || isSubmitting }}
        centerButton={saveProgressButton}
        contentClassName="min-h-[400px]"
      >
        {/* Step 1: Basic Access Information */}
        <Step>
          <BasicAccessStep data={formData} onChange={updateFormData} />
        </Step>

        {/* Step 2: Key Contacts */}
        <Step>
          <KeyContactsStep data={formData} onChange={updateFormData} />
        </Step>

        {/* Step 3: Documents & Financial */}
        <Step>
          <DocumentsFinancialStep data={formData} onChange={updateFormData} />
        </Step>

        {/* Step 4: Property & Digital Life */}
        <Step>
          <PropertyDigitalStep data={formData} onChange={updateFormData} />
        </Step>

        {/* Step 5: Healthcare & End-of-Life */}
        <Step>
          <HealthcareEndOfLifeStep data={formData} onChange={updateFormData} />
        </Step>

        {/* Step 6: Special Items & Final Details */}
        <Step>
          <SpecialItemsFinalStep data={formData} onChange={updateFormData} />
        </Step>
      </Stepper>
    </div>
  );
}
