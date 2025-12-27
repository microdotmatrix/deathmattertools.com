export type EntryFeedbackTargetItem = {
  key: string;
  label: string;
};

export type EntryFeedbackTargetGroup = {
  label: string;
  items: EntryFeedbackTargetItem[];
};

export const ENTRY_FEEDBACK_TARGET_GROUPS: EntryFeedbackTargetGroup[] = [
  {
    label: "Entry Basics",
    items: [
      { key: "entry.name", label: "Full Name" },
      { key: "entry.locationBorn", label: "Birth Location" },
      { key: "entry.locationDied", label: "Death Location" },
      { key: "entry.dateOfBirth", label: "Birth Date" },
      { key: "entry.dateOfDeath", label: "Death Date" },
      { key: "entry.causeOfDeath", label: "Cause of Death" },
      { key: "entry.image", label: "Primary Photo" },
    ],
  },
  {
    label: "Obituary Details",
    items: [
      { key: "entryDetails.occupation", label: "Occupation" },
      { key: "entryDetails.jobTitle", label: "Job Title" },
      { key: "entryDetails.companyName", label: "Company Name" },
      { key: "entryDetails.yearsWorked", label: "Years Worked" },
      { key: "entryDetails.educationDetails", label: "Education" },
      { key: "entryDetails.accomplishments", label: "Accomplishments" },
      { key: "entryDetails.biographicalSummary", label: "Biographical Summary" },
      { key: "entryDetails.hobbies", label: "Hobbies" },
      { key: "entryDetails.personalInterests", label: "Personal Interests" },
      { key: "entryDetails.militaryService", label: "Military Service" },
      { key: "entryDetails.religious", label: "Religion" },
      { key: "entryDetails.familyDetails", label: "Family Details" },
      { key: "entryDetails.survivedBy", label: "Survived By" },
      { key: "entryDetails.precededBy", label: "Preceded By" },
      { key: "entryDetails.serviceDetails", label: "Service Details" },
      { key: "entryDetails.donationRequests", label: "Donation Requests" },
      { key: "entryDetails.specialAcknowledgments", label: "Special Acknowledgments" },
      { key: "entryDetails.additionalNotes", label: "Additional Notes" },
    ],
  },
  {
    label: "Media",
    items: [{ key: "images.gallery", label: "Photos & Images" }],
  },
];

const TARGET_LABELS = new Map(
  ENTRY_FEEDBACK_TARGET_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.key, item.label] as const)
  )
);

export const isValidEntryFeedbackTarget = (key: string | null | undefined) => {
  if (!key) return false;
  return TARGET_LABELS.has(key);
};

export const getEntryFeedbackTargetLabel = (
  key: string | null | undefined
) => {
  if (!key) return "General";
  return TARGET_LABELS.get(key) ?? `Unknown target (${key})`;
};
