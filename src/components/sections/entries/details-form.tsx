"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import Stepper, { Step } from "@/components/elements/multi-step";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEntryDetailsForm } from "@/lib/state";
import { cn, formatTime } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface ObituaryFormData {
  // Biographical details
  occupation?: string;
  jobTitle?: string;
  companyName?: string;
  yearsWorked?: string;
  education?: string;
  accomplishments?: string;
  biographicalSummary?: string;
  hobbies?: string;
  personalInterests?: string;

  // Military service
  militaryService?: boolean;
  militaryBranch?: string;
  militaryYearsServed?: number;
  militaryRank?: string;

  // Religious information
  religious?: boolean;
  denomination?: string;
  organization?: string;
  favoriteScripture?: string;

  // Family and relationships
  familyDetails?: string;
  survivedBy?: FamilyMember[];
  precededBy?: FamilyMember[];

  // Service details and additional information
  serviceDetails?: Service[];
  educationDetails?: Education[];
  donationRequests?: string;
  specialAcknowledgments?: string;
  additionalNotes?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  location?: string;
}

interface Service {
  id: string;
  location: string;
  address: string;
  type: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
}

interface Education {
  id: string;
  type: string;
  institution: string;
  yearGraduated: number;
}

// Helper functions for serialization/deserialization
const serializeFamilyMembers = (
  members: FamilyMember[] | undefined
): string | undefined => {
  if (!members || members.length === 0) return undefined;
  try {
    return JSON.stringify(members);
  } catch {
    return undefined;
  }
};

const deserializeFamilyMembers = (data: string | undefined): FamilyMember[] => {
  if (!data || data.trim() === "") return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (member) =>
          member &&
          typeof member === "object" &&
          typeof member.id === "string" &&
          typeof member.name === "string" &&
          typeof member.relationship === "string"
      );
    }
  } catch {
    // If parsing fails, treat as legacy text format and create a single member
    return [
      {
        id: Date.now().toString(),
        name: data.trim(),
        relationship: "Family member",
      },
    ];
  }
  return [];
};

const serializeServices = (
  services: Service[] | undefined
): string | undefined => {
  if (!services || services.length === 0) return undefined;
  try {
    // Convert Date objects to ISO strings for serialization
    const serializedServices = services.map((service) => ({
      ...service,
      date: service.date ? service.date.toISOString() : undefined,
    }));
    return JSON.stringify(serializedServices);
  } catch {
    return undefined;
  }
};

const deserializeServices = (data: string | undefined): Service[] => {
  if (!data || data.trim() === "") return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (service) =>
            service &&
            typeof service === "object" &&
            typeof service.id === "string" &&
            typeof service.location === "string" &&
            typeof service.address === "string"
        )
        .map((service) => ({
          ...service,
          date: service.date ? new Date(service.date) : undefined,
          startTime: service.startTime || "",
          endTime: service.endTime || "",
        }));
    }
  } catch {
    // If parsing fails, treat as legacy text format - don't create a service from plain text
    return [];
  }
  return [];
};

const serializeEducation = (
  education: Education[] | undefined
): string | undefined => {
  if (!education || education.length === 0) return undefined;
  try {
    return JSON.stringify(education);
  } catch {
    return undefined;
  }
};

const deserializeEducation = (data: string | undefined): Education[] => {
  if (!data || data.trim() === "") return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (education) =>
          education &&
          typeof education === "object" &&
          typeof education.id === "string" &&
          typeof education.type === "string" &&
          typeof education.institution === "string" &&
          typeof education.yearGraduated === "number"
      );
    }
  } catch {
    // If parsing fails, return empty array - don't create education from plain text
    return [];
  }
  return [];
};

interface ObituaryFormProps {
  initialData?: Partial<any>; // Allow initial data to have string format from DB
  onSubmit: (data: any) => Promise<void>; // Allow serialized data to be passed
  onCancel?: () => void;
}

export const EntryDetailsForm = ({
  initialData = {},
  onSubmit,
  onCancel,
}: ObituaryFormProps) => {
  // Process initial data to convert string fields to arrays for family members, services, and education
  const processedInitialData: ObituaryFormData = {
    ...initialData,
    survivedBy: deserializeFamilyMembers(initialData?.survivedBy),
    precededBy: deserializeFamilyMembers(initialData?.precededBy),
    serviceDetails: deserializeServices(initialData?.serviceDetails),
    educationDetails: deserializeEducation(initialData?.educationDetails),
  };

  const [formData, setFormData] =
    useState<ObituaryFormData>(processedInitialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { openDetails, setOpenDetails } = useEntryDetailsForm();
  const router = useRouter();

  const updateFormData = (updates: Partial<ObituaryFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addFamilyMember = (type: "survivedBy" | "precededBy") => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: "",
      relationship: "",
    };

    setFormData((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), newMember],
    }));
  };

  const updateFamilyMember = (
    type: "survivedBy" | "precededBy",
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type]?.map((member: FamilyMember) =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));
  };

  const removeFamilyMember = (
    type: "survivedBy" | "precededBy",
    id: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type]?.filter((member: FamilyMember) => member.id !== id),
    }));
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      location: "",
      address: "",
      type: "Funeral",
      date: undefined,
      startTime: "",
      endTime: "",
    };

    setFormData((prev) => ({
      ...prev,
      serviceDetails: [...(prev.serviceDetails || []), newService],
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      type: "",
      institution: "",
      yearGraduated: new Date().getFullYear(),
    };

    setFormData((prev) => ({
      ...prev,
      educationDetails: [...(prev.educationDetails || []), newEducation],
    }));
  };

  const updateService = (
    id: string,
    field: keyof Service,
    value: string | Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      serviceDetails: prev.serviceDetails?.map((service: Service) =>
        service.id === id ? { ...service, [field]: value } : service
      ),
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      educationDetails: prev.educationDetails?.map((education: Education) =>
        education.id === id ? { ...education, [field]: value } : education
      ),
    }));
  };

  const removeService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceDetails: prev.serviceDetails?.filter(
        (service: Service) => service.id !== id
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      educationDetails: prev.educationDetails?.filter(
        (education: Education) => education.id !== id
      ),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      startTransition(async () => {
        // Serialize family member arrays and services to strings before submitting
        const serializedFormData = {
          ...formData,
          survivedBy: serializeFamilyMembers(formData.survivedBy),
          precededBy: serializeFamilyMembers(formData.precededBy),
          serviceDetails: serializeServices(formData.serviceDetails),
          educationDetails: serializeEducation(formData.educationDetails),
          // Generate education types and years for easy querying
          educationTypes: formData.educationDetails?.map(ed => ed.type).join(','),
          educationYears: formData.educationDetails?.map(ed => ed.yearGraduated.toString()).join(','),
        };
        await onSubmit(serializedFormData);
        setOpenDetails(false);
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  const saveProgressButton = (
    <Button
      type="button"
      onClick={handleSave}
      disabled={isSubmitting || isPending}
      variant="outline"
    >
      {isSubmitting || isPending ? "Saving..." : "Save Progress"}
    </Button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Stepper
        onFinalStepCompleted={handleSubmit}
        nextButtonProps={{ disabled: isSubmitting || isPending }}
        backButtonProps={{ disabled: isSubmitting || isPending }}
        centerButton={saveProgressButton}
        contentClassName="min-h-96"
      >
        {/* Step 1: Biographical Details */}
        <Step>
          <BiographicalDetailsStep
            data={formData}
            onChange={updateFormData}
            addEducation={addEducation}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
          />
        </Step>

        {/* Step 2: Family and Relationships */}
        <Step>
          <FamilyRelationshipsStep
            data={formData}
            onChange={updateFormData}
            addFamilyMember={addFamilyMember}
            updateFamilyMember={updateFamilyMember}
            removeFamilyMember={removeFamilyMember}
          />
        </Step>

        {/* Step 3: Service Details and Additional Information */}
        <Step>
          <ServiceDetailsStep
            data={formData}
            onChange={updateFormData}
            onCancel={onCancel}
            addService={addService}
            updateService={updateService}
            removeService={removeService}
          />
        </Step>
      </Stepper>
    </div>
  );
};

interface StepProps {
  data: ObituaryFormData;
  onChange: (updates: Partial<ObituaryFormData>) => void;
  addFamilyMember?: (type: "survivedBy" | "precededBy") => void;
  updateFamilyMember?: (
    type: "survivedBy" | "precededBy",
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => void;
  removeFamilyMember?: (type: "survivedBy" | "precededBy", id: string) => void;
  addService?: () => void;
  updateService?: (
    id: string,
    field: keyof Service,
    value: string | Date | undefined
  ) => void;
  removeService?: (id: string) => void;
  addEducation?: () => void;
  updateEducation?: (
    id: string,
    field: keyof Education,
    value: string | number
  ) => void;
  removeEducation?: (id: string) => void;
}

const BiographicalDetailsStep = ({ data, onChange, addEducation, updateEducation, removeEducation }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground">
          Biographical Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about their career, education, and life story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <AnimatedInput
          label="Occupation"
          name="occupation"
          controlled={true}
          value={data.occupation || ""}
          onChange={(e) => onChange({ occupation: e.target.value })}
          placeholder="e.g., Teacher, Engineer, Artist"
        />

        <AnimatedInput
          label="Job Title"
          name="jobTitle"
          controlled={true}
          value={data.jobTitle || ""}
          onChange={(e) => onChange({ jobTitle: e.target.value })}
          placeholder="e.g., Senior Software Engineer"
        />

        <AnimatedInput
          label="Company/Organization"
          name="companyName"
          controlled={true}
          value={data.companyName || ""}
          onChange={(e) => onChange({ companyName: e.target.value })}
          placeholder="e.g., ABC Corporation"
        />

        <AnimatedInput
          label="Years Worked"
          name="yearsWorked"
          controlled={true}
          value={data.yearsWorked || ""}
          onChange={(e) => onChange({ yearsWorked: e.target.value })}
          placeholder="e.g., 1985-2010 or 25 years"
        />
      </div>

      <EducationInputs
        formData={data}
        addEducation={addEducation}
        updateEducation={updateEducation}
        removeEducation={removeEducation}
      />

      <AnimatedInput
        label="Biographical Summary"
        name="biographicalSummary"
        type="textarea"
        controlled={true}
        value={data.biographicalSummary || ""}
        onChange={(e) => onChange({ biographicalSummary: e.target.value })}
        placeholder="A brief overview of their life story, character, and what made them special..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <AnimatedInput
          label="Accomplishments & Achievements"
          name="accomplishments"
          type="textarea"
          controlled={true}
          value={data.accomplishments || ""}
          onChange={(e) => onChange({ accomplishments: e.target.value })}
          placeholder="Awards, recognitions, career highlights..."
          className="h-16"
        />

        <AnimatedInput
          label="Personal Interests"
          name="personalInterests"
          type="textarea"
          controlled={true}
          value={data.personalInterests || ""}
          onChange={(e) => onChange({ personalInterests: e.target.value })}
          placeholder="Hobbies, passions, causes they cared about, special interests..."
          className="h-16"
        />
      </div>

      {/* Military Service Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="militaryService"
            checked={data.militaryService || false}
            onCheckedChange={(checked) =>
              onChange({
                militaryService: checked as boolean,
                // Clear military fields if unchecking
                ...(checked
                  ? {}
                  : {
                      militaryBranch: "",
                      militaryYearsServed: undefined,
                      militaryRank: "",
                    }),
              })
            }
          />
          <Label
            htmlFor="militaryService"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Military Service?
          </Label>
        </div>

        {data.militaryService && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6 mt-8">
            <Select
              value={data.militaryBranch || ""}
              onValueChange={(value) => onChange({ militaryBranch: value })}
            >
              <SelectTrigger className="w-full py-4.75">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Army">Army</SelectItem>
                <SelectItem value="Navy">Navy</SelectItem>
                <SelectItem value="Air-Force">Air Force</SelectItem>
                <SelectItem value="Marines">Marines</SelectItem>
                <SelectItem value="Coast-Guard">Coast Guard</SelectItem>
                <SelectItem value="Space-Force">Space Force</SelectItem>
                <SelectItem value="National-Guard">National Guard</SelectItem>
                <SelectItem value="Reserves">Reserves</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <AnimatedInput
              label="Years Served"
              name="militaryYearsServed"
              controlled={true}
              value={data.militaryYearsServed?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === "" ? undefined : parseInt(value, 10);
                onChange({
                  militaryYearsServed: isNaN(numValue || 0)
                    ? undefined
                    : numValue,
                });
              }}
              placeholder="e.g., 4 (number of years)"
            />

            <AnimatedInput
              label="Rank"
              name="militaryRank"
              controlled={true}
              value={data.militaryRank || ""}
              onChange={(e) => onChange({ militaryRank: e.target.value })}
              placeholder="e.g., Sergeant, Lieutenant"
            />
          </div>
        )}
      </div>

      {/* Religious Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="religious"
            checked={data.religious || false}
            onCheckedChange={(checked) =>
              onChange({
                religious: checked as boolean,
                // Clear religious fields if unchecking
                ...(checked
                  ? {}
                  : {
                      denomination: "",
                      organization: "",
                      favoriteScripture: "",
                    }),
              })
            }
          />
          <Label
            htmlFor="religious"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Religious?
          </Label>
        </div>

        {data.religious && (
          <div className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <Select
                value={data.denomination || ""}
                onValueChange={(value) => onChange({ denomination: value })}
              >
                <SelectTrigger className="w-full py-4.75">
                  <SelectValue placeholder="Select denomination" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Christian Traditions
                  </div>
                  <SelectItem value="catholic">Catholic</SelectItem>
                  <SelectItem value="protestant">Protestant</SelectItem>
                  <SelectItem value="baptist">Baptist</SelectItem>
                  <SelectItem value="methodist">Methodist</SelectItem>
                  <SelectItem value="lutheran">Lutheran</SelectItem>
                  <SelectItem value="pentecostal">Pentecostal</SelectItem>
                  <SelectItem value="presbyterian">Presbyterian</SelectItem>
                  <SelectItem value="episcopal">Episcopal</SelectItem>
                  <SelectItem value="orthodox">Orthodox</SelectItem>
                  <SelectItem value="non-denominational">Non-denominational</SelectItem>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Jewish Traditions
                  </div>
                  <SelectItem value="reform-jewish">Reform Judaism</SelectItem>
                  <SelectItem value="conservative-jewish">Conservative Judaism</SelectItem>
                  <SelectItem value="orthodox-jewish">Orthodox Judaism</SelectItem>
                  <SelectItem value="hasidic">Hasidic</SelectItem>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Islamic Traditions
                  </div>
                  <SelectItem value="sunni">Sunni</SelectItem>
                  <SelectItem value="shia">Shia</SelectItem>
                  <SelectItem value="sufi">Sufi</SelectItem>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Eastern Traditions
                  </div>
                  <SelectItem value="hindu">Hindu</SelectItem>
                  <SelectItem value="buddhist">Buddhist</SelectItem>
                  <SelectItem value="taoist">Taoist</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                  <SelectItem value="jain">Jain</SelectItem>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Indigenous & Other Faiths
                  </div>
                  <SelectItem value="indigenous">Indigenous / First Nations</SelectItem>
                  <SelectItem value="bahai">Bahá'í</SelectItem>
                  <SelectItem value="humanist">Humanist / Spiritual but not Religious</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>

              <AnimatedInput
                label="Organization"
                name="organization"
                controlled={true}
                value={data.organization || ""}
                onChange={(e) => onChange({ organization: e.target.value })}
                placeholder="e.g., First Baptist Church"
              />
            </div>

            <AnimatedInput
              label="Favorite Scripture"
              name="favoriteScripture"
              type="textarea"
              controlled={true}
              value={data.favoriteScripture || ""}
              onChange={(e) => onChange({ favoriteScripture: e.target.value })}
              placeholder="Enter a meaningful biblical verse or quote..."
              className="h-24"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const FamilyRelationshipsStep = ({
  data,
  onChange,
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
}: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Family & Relationships
        </h3>
        <p className="text-sm text-muted-foreground">
          Share information about their family, close friends, and loved ones.
        </p>
      </div>

      <FamilyMemberInputs
        type="survivedBy"
        formData={data}
        onChange={onChange}
        addFamilyMember={addFamilyMember}
        updateFamilyMember={updateFamilyMember}
        removeFamilyMember={removeFamilyMember}
      />

      <FamilyMemberInputs
        type="precededBy"
        formData={data}
        onChange={onChange}
        addFamilyMember={addFamilyMember}
        updateFamilyMember={updateFamilyMember}
        removeFamilyMember={removeFamilyMember}
      />

      <div className="mt-8">
        <AnimatedInput
          label="Family Details"
          name="familyDetails"
          type="textarea"
          controlled={true}
          value={data.familyDetails || ""}
          onChange={(e) => onChange({ familyDetails: e.target.value })}
          placeholder="Any other relevant details about their family, close friends, or colleagues..."
          className="h-24"
        />
      </div>
    </div>
  );
};

const FamilyMemberInputs = ({
  type,
  formData,
  onChange,
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
}: {
  type: "survivedBy" | "precededBy";
  formData: ObituaryFormData;
  onChange: (data: ObituaryFormData) => void;
  addFamilyMember?: (type: "survivedBy" | "precededBy") => void;
  updateFamilyMember?: (
    type: "survivedBy" | "precededBy",
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => void;
  removeFamilyMember?: (type: "survivedBy" | "precededBy", id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="survivedBy">
          {type === "survivedBy" ? "Survived By" : "PrecededBy"}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addFamilyMember?.(type)}
        >
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {formData[type]?.map((member: FamilyMember) => (
        <div
          key={member.id}
          className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border rounded-lg"
        >
          <Input
            name="name"
            placeholder="Name"
            value={member.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFamilyMember?.(type, member.id, "name", e.target.value)
            }
          />
          <Select
            value={member.relationship}
            onValueChange={(value) =>
              updateFamilyMember?.(type, member.id, "relationship", value)
            }
          >
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="child">Child</SelectItem>
              <SelectItem value="ancestor">Ancestor</SelectItem>
              <SelectItem value="descendant">Descendant</SelectItem>
              <SelectItem value="cousin">Cousin</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="spouse">Spouse</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            className="w-full lg:w-fit"
            onClick={() => removeFamilyMember?.(type, member.id)}
          >
            <Icon icon="lucide:trash" className="size-4" />
            <span className="md:sr-only">Remove</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

const EducationInputs = ({
  formData,
  addEducation,
  updateEducation,
  removeEducation,
}: {
  formData: ObituaryFormData;
  addEducation?: () => void;
  updateEducation?: (
    id: string,
    field: keyof Education,
    value: string | number
  ) => void;
  removeEducation?: (id: string) => void;
}) => {
  // Generate years from 1900 to 2025
  const years = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 1900 + i);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="educationDetails">Education</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addEducation?.()}
        >
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {formData.educationDetails?.map((education: Education) => (
        <div
          key={education.id}
          className="flex flex-col gap-4 p-4 border rounded-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex flex-row gap-2">
              <Select
                value={education.type}
                onValueChange={(value) =>
                  updateEducation?.(education.id, "type", value)
                }
              >
                <SelectTrigger className="md:shrink-0 grow max-w-1/2 overflow-hidden">
                  <SelectValue placeholder="Education Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="ged">GED</SelectItem>
                  <SelectItem value="vocational">Vocational/Technical School</SelectItem>
                  <SelectItem value="college">College/University</SelectItem>
                  <SelectItem value="advanced-degree">Advanced Degree</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
  
              <Select
                value={education.yearGraduated?.toString()}
                onValueChange={(value) =>
                  updateEducation?.(education.id, "yearGraduated", parseInt(value, 10))
                }
              >
                <SelectTrigger className="md:shrink-0 grow">
                  <SelectValue placeholder="Year Graduated" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              name="institution"
              placeholder="School Name/Location"
              value={education.institution}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateEducation?.(education.id, "institution", e.target.value)
              }
            />

            <Button
              type="button"
              variant="outline"
            className="w-full lg:w-fit"
              onClick={() => removeEducation?.(education.id)}
            >
              <Icon icon="lucide:trash" className="size-4" />
              <span className="md:sr-only">Remove</span>
            </Button>
          </div>
        </div>
      ))}

      {/* Legacy education field display for backward compatibility */}
      {formData.education && formData.education.trim() !== "" && (!formData.educationDetails || formData.educationDetails.length === 0) && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Previous Education Information</Label>
            <span className="text-xs text-muted-foreground">Legacy format</span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {formData.education}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            You can add new education details above to replace this legacy information.
          </p>
        </div>
      )}
    </div>
  );
};

const ServiceInputs = ({
  formData,
  addService,
  updateService,
  removeService,
}: {
  formData: ObituaryFormData;
  addService?: () => void;
  updateService?: (
    id: string,
    field: keyof Service,
    value: string | Date | undefined
  ) => void;
  removeService?: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="serviceDetails">Service Details</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addService?.()}
        >
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {formData.serviceDetails?.map((service: Service) => (
        <div
          key={service.id}
          className="flex flex-col gap-4 p-4 border rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="location"
              placeholder="Service Location"
              value={service.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateService?.(service.id, "location", e.target.value)
              }
            />
            <Input
              name="address"
              placeholder="Address"
              value={service.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateService?.(service.id, "address", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <Select
              value={service.type}
              onValueChange={(value) =>
                updateService?.(service.id, "type", value)
              }
            >
              <SelectTrigger className="w-full md:shrink md:w-28">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Funeral">Funeral</SelectItem>
                <SelectItem value="Wake">Wake</SelectItem>
                <SelectItem value="Vigil">Vigil</SelectItem>
                <SelectItem value="Memorial">Memorial</SelectItem>
                <SelectItem value="Reception">Reception</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 max-w-full w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal truncate",
                      !service.date && "text-muted-foreground"
                    )}
                  >
                    <Icon icon="lucide:calendar" className="mr-1 h-4 w-4" />
                    {service.date ? (
                      `${format(service.date, "PPP")} ${
                        service.startTime
                          ? `${formatTime(service.startTime)}`
                          : ""
                      }${service.startTime && service.endTime ? " - " : ""}${
                        service.endTime ? `${formatTime(service.endTime)}` : ""
                      }`
                    ) : (
                      <span>Pick date and time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DateTimePicker
                    date={service.date}
                    startTime={service.startTime}
                    endTime={service.endTime}
                    setDate={(date: Date) =>
                      updateService?.(service.id, "date", date)
                    }
                    setStartTime={(time: string) =>
                      updateService?.(service.id, "startTime", time)
                    }
                    setEndTime={(time: string) =>
                      updateService?.(service.id, "endTime", time)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full lg:w-fit flex items-center gap-2"
              onClick={() => removeService?.(service.id)}
            >
              <Icon icon="lucide:trash" className="size-3 md:size-4" />{" "}
              <span className="md:sr-only">Remove</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ServiceDetailsStepProps extends StepProps {
  onCancel?: () => void;
}

const ServiceDetailsStep = ({
  data,
  onChange,
  onCancel,
  addService,
  updateService,
  removeService,
}: ServiceDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Service Details & More
        </h3>
        <p className="text-sm text-muted-foreground">
          Final details about services and any additional information
        </p>
      </div>

      <ServiceInputs
        formData={data}
        addService={addService}
        updateService={updateService}
        removeService={removeService}
      />

      <div className="space-y-6 mt-8">
        <AnimatedInput
          label="Donation Requests"
          name="donationRequests"
          type="textarea"
          controlled={true}
          value={data.donationRequests || ""}
          onChange={(e) => onChange({ donationRequests: e.target.value })}
          placeholder="Preferred charities or causes for donations in lieu of flowers..."
          className="h-24"
        />

        <AnimatedInput
          label="Special Acknowledgments"
          name="specialAcknowledgments"
          type="textarea"
          controlled={true}
          value={data.specialAcknowledgments || ""}
          onChange={(e) => onChange({ specialAcknowledgments: e.target.value })}
          placeholder="Thank you messages, special mentions to caregivers, friends, or organizations..."
          className="h-24"
        />

        <AnimatedInput
          label="Additional Notes"
          name="additionalNotes"
          type="textarea"
          controlled={true}
          value={data.additionalNotes || ""}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder="Any other relevant information you'd like to include in the obituary..."
          className="h-24"
        />
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-center pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};