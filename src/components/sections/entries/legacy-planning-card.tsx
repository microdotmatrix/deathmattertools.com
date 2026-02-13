import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import type { PreNeedSurveyResponse } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import Link from "next/link";

type LegacyPlanningCardProps = {
  entryId: string;
  surveyId: string;
  surveyResponse: PreNeedSurveyResponse;
  canEdit?: boolean;
};

type SectionItem = {
  label: string;
  value: string | null | undefined;
  isSensitive?: boolean;
};

type Section = {
  title: string;
  icon: string;
  items: SectionItem[];
};

export const LegacyPlanningCard = ({
  entryId,
  surveyId,
  surveyResponse,
  canEdit = false,
}: LegacyPlanningCardProps) => {
  const sections: Section[] = [
    {
      title: "Key Contacts",
      icon: "mdi:account-multiple",
      items: [
        { label: "Emergency Contact", value: formatContact(surveyResponse.emergencyContactName, surveyResponse.emergencyContactPhone) },
        { label: "Attorney", value: formatContact(surveyResponse.attorneyName, surveyResponse.attorneyPhone) },
        { label: "Financial Advisor", value: formatContact(surveyResponse.financialAdvisorName, surveyResponse.financialAdvisorPhone) },
      ].filter(item => item.value),
    },
    {
      title: "Important Documents",
      icon: "mdi:file-document-multiple",
      items: [
        { label: "Will", value: surveyResponse.hasWill === "yes" ? `Location: ${surveyResponse.willLocation || "Not specified"}` : null },
        { label: "Power of Attorney (Financial)", value: surveyResponse.hasPowerOfAttorneyFinancial ? "Yes" : null },
        { label: "Power of Attorney (Healthcare)", value: surveyResponse.hasPowerOfAttorneyHealthcare ? "Yes" : null },
        { label: "Living Will", value: surveyResponse.hasLivingWill ? "Yes" : null },
        { label: "Healthcare Proxy", value: surveyResponse.hasHealthCareProxy ? "Yes" : null },
        { label: "Documents Location", value: surveyResponse.legalDocsLocation },
      ].filter(item => item.value),
    },
    {
      title: "Financial Information",
      icon: "mdi:bank",
      items: [
        { label: "Life Insurance", value: surveyResponse.hasLifeInsurance ? surveyResponse.lifeInsuranceCompany || "Yes" : null },
        { label: "Banks/Credit Unions", value: surveyResponse.banksCreditUnions, isSensitive: true },
        { label: "Investment Accounts", value: surveyResponse.investmentAccounts, isSensitive: true },
        { label: "End-of-Life Funding", value: surveyResponse.hasEndOfLifeFunding ? surveyResponse.fundingLocation || "Yes" : null },
      ].filter(item => item.value),
    },
    {
      title: "Property & Assets",
      icon: "mdi:home",
      items: [
        { label: "Property", value: surveyResponse.ownsOrRentsProperty ? surveyResponse.propertyAddress || "Has property" : null },
        { label: "Vehicles", value: surveyResponse.hasVehicles ? "Yes" : null },
        { label: "Safe Deposit Box", value: surveyResponse.hasSafeDepositBox ? "Yes" : null },
        { label: "Storage Unit", value: surveyResponse.hasStorageUnit ? "Yes" : null },
      ].filter(item => item.value),
    },
    {
      title: "Digital Life",
      icon: "mdi:laptop",
      items: [
        { label: "Password Manager", value: surveyResponse.usesPasswordManager ? surveyResponse.passwordManagerName || "Yes" : null },
        { label: "Accounts to Delete", value: surveyResponse.accountsToDelete },
        { label: "Accounts to Memorialize", value: surveyResponse.accountsToMemorialize },
      ].filter(item => item.value),
    },
    {
      title: "Healthcare",
      icon: "mdi:medical-bag",
      items: [
        { label: "Primary Doctor", value: formatContact(surveyResponse.primaryDoctorName, surveyResponse.primaryDoctorPhone) },
        { label: "Preferred Hospital", value: surveyResponse.preferredHospital },
        { label: "Organ Donation", value: formatOrganDonation(surveyResponse.organDonationPreference) },
        { label: "Critical Medications", value: surveyResponse.criticalMedications },
      ].filter(item => item.value),
    },
    {
      title: "End-of-Life Preferences",
      icon: "mdi:flower",
      items: [
        { label: "Service Type", value: formatServiceType(surveyResponse.serviceTypePreference) },
        { label: "Final Arrangement", value: formatFinalArrangement(surveyResponse.finalArrangementPreference) },
        { label: "Funeral Home", value: surveyResponse.funeralHomeProvider },
        { label: "Religious/Spiritual Notes", value: surveyResponse.religiousSpiritualNotes },
        { label: "Preferred Charities", value: surveyResponse.preferredCharities },
      ].filter(item => item.value),
    },
  ];

  // Filter out empty sections
  const populatedSections = sections.filter(section => section.items.length > 0);

  if (populatedSections.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:clipboard-check" className="size-5 text-primary" />
            <CardTitle>Legacy Planning Information</CardTitle>
          </div>
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/surveys?surveyId=${surveyId}`}>
                <Icon icon="mdi:pencil" className="size-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
        </div>
        <CardDescription>
          Important information gathered from the pre-need survey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {populatedSections.map((section) => (
          <LegacySection key={section.title} section={section} />
        ))}
      </CardContent>
    </Card>
  );
};

const LegacySection = ({ section }: { section: Section }) => {
  return (
    <Collapsible defaultOpen className="group">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
        <Icon icon={section.icon} className="size-4 text-muted-foreground" />
        <span>{section.title}</span>
        <Badge variant="secondary" className="ml-auto mr-2 text-xs">
          {section.items.length}
        </Badge>
        <Icon
          icon="mdi:chevron-down"
          className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="mt-2 space-y-2 pl-6">
          {section.items.map((item) => (
            <div key={item.label} className="grid grid-cols-[140px_1fr] gap-2 text-sm">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className={cn("font-medium", item.isSensitive && "blur-sm hover:blur-none transition-all cursor-pointer")}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Helper functions
function formatContact(name: string | null | undefined, phone: string | null | undefined): string | null {
  if (!name && !phone) return null;
  if (name && phone) return `${name} (${phone})`;
  return name || phone || null;
}

function formatOrganDonation(pref: string | null | undefined): string | null {
  if (!pref) return null;
  const map: Record<string, string> = {
    yes: "Yes - Registered Donor",
    no: "No",
    family_decides: "Family Decides",
  };
  return map[pref] || pref;
}

function formatServiceType(pref: string | null | undefined): string | null {
  if (!pref || pref === "no_preference") return null;
  const map: Record<string, string> = {
    funeral: "Traditional Funeral",
    memorial: "Memorial Service",
    celebration: "Celebration of Life",
    private: "Private Service",
  };
  return map[pref] || pref;
}

function formatFinalArrangement(pref: string | null | undefined): string | null {
  if (!pref || pref === "no_preference") return null;
  const map: Record<string, string> = {
    burial: "Burial",
    cremation: "Cremation",
    green_burial: "Green Burial",
  };
  return map[pref] || pref;
}
