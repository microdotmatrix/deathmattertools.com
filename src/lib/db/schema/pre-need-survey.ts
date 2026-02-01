import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { EntryTable } from "./entries";
import { ShareLinkTable } from "./share-links";
import { UserTable } from "./users";

// ============================================================================
// Survey Status Enum
// ============================================================================

export const SURVEY_STATUSES = [
  "draft", // Owner created, not yet shared
  "shared", // Share link created, client can access
  "submitted", // Client completed and submitted
  "under_review", // Owner reviewing responses
  "approved", // Owner approved, ready to populate entry
  "locked", // Survey locked from further edits
] as const;

export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

// ============================================================================
// Pre-Need Survey Table
// ============================================================================

export const PreNeedSurveyTable = pgTable(
  "pre_need_survey",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),

    // Ownership
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    organizationId: text("organization_id"),

    // Entry association (required - surveys are always tied to an entry)
    entryId: text("entry_id")
      .notNull()
      .references(() => EntryTable.id, { onDelete: "cascade" }),

    // Survey metadata
    title: text("title").notNull().default("Pre-Need Survey"),
    clientName: text("client_name"), // Person filling out the survey
    clientEmail: text("client_email"), // For notifications
    clientRelationship: text("client_relationship"), // Relationship to subject

    // Status workflow
    status: varchar("status", { enum: SURVEY_STATUSES })
      .notNull()
      .default("draft"),
    statusChangedAt: timestamp("status_changed_at"),
    statusChangedBy: text("status_changed_by").references(() => UserTable.id),

    // Locking mechanism
    isLocked: boolean("is_locked").notNull().default(false),
    lockedAt: timestamp("locked_at"),
    lockedBy: text("locked_by").references(() => UserTable.id),

    // Progress tracking
    completionPercentage: integer("completion_percentage").notNull().default(0),
    currentStep: integer("current_step").notNull().default(1),
    lastClientAccessAt: timestamp("last_client_access_at"),

    // Share link reference (set when share link is created)
    shareLinkId: uuid("share_link_id"),
    shareToken: text("share_token"), // Cached token for easy access

    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("pre_need_survey_user_id_idx").on(table.userId),
    index("pre_need_survey_organization_id_idx").on(table.organizationId),
    index("pre_need_survey_entry_id_idx").on(table.entryId),
    index("pre_need_survey_status_idx").on(table.status),
  ]
);

// ============================================================================
// Pre-Need Survey Response Table
// ============================================================================

export const PreNeedSurveyResponseTable = pgTable(
  "pre_need_survey_response",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => PreNeedSurveyTable.id, { onDelete: "cascade" }),

    // ========================================================================
    // Section 1: Basic Access Information
    // ========================================================================
    fullName: text("full_name"),
    preferredName: text("preferred_name"),
    needsAccessCodes: boolean("needs_access_codes"),
    phoneDeviceHint: text("phone_device_hint"),
    passwordManagerHint: text("password_manager_hint"),
    accessDetailsLocation: text("access_details_location"),

    // ========================================================================
    // Section 2: Key People to Contact
    // ========================================================================
    // Emergency contact
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactRelationship: text("emergency_contact_relationship"),
    emergencyContactPhone: text("emergency_contact_phone"),
    emergencyContactNotes: text("emergency_contact_notes"),
    // Professional advisors (JSON arrays)
    hasAttorney: boolean("has_attorney"),
    attorneyName: text("attorney_name"),
    attorneyPhone: text("attorney_phone"),
    hasFinancialAdvisor: boolean("has_financial_advisor"),
    financialAdvisorName: text("financial_advisor_name"),
    financialAdvisorPhone: text("financial_advisor_phone"),

    // ========================================================================
    // Section 3: Important Documents
    // ========================================================================
    hasWill: varchar("has_will", { enum: ["yes", "no", "unsure"] }),
    willLocation: text("will_location"),
    willAttorneyName: text("will_attorney_name"),
    // Legal documents (checkboxes)
    hasPowerOfAttorneyFinancial: boolean("has_poa_financial"),
    hasPowerOfAttorneyHealthcare: boolean("has_poa_healthcare"),
    hasLivingWill: boolean("has_living_will"),
    hasHealthCareProxy: boolean("has_health_care_proxy"),
    legalDocsDesignatedPerson: text("legal_docs_designated_person"),
    legalDocsDesignatedPhone: text("legal_docs_designated_phone"),
    legalDocsLocation: text("legal_docs_location"),

    // ========================================================================
    // Section 4: Financial Information
    // ========================================================================
    hasEndOfLifeFunding: boolean("has_end_of_life_funding"),
    fundingLocation: text("funding_location"),
    isPreneedPlan: boolean("is_preneed_plan"),
    hasLifeInsurance: boolean("has_life_insurance"),
    lifeInsuranceCompany: text("life_insurance_company"),
    lifeInsurancePolicyLocation: text("life_insurance_policy_location"),
    lifeInsuranceBeneficiary: text("life_insurance_beneficiary"),
    banksCreditUnions: text("banks_credit_unions"),
    investmentAccounts: text("investment_accounts"),
    otherFinancialAccounts: text("other_financial_accounts"),
    accountDetailsLocation: text("account_details_location"),

    // ========================================================================
    // Section 5: Property & Assets
    // ========================================================================
    ownsOrRentsProperty: boolean("owns_or_rents_property"),
    propertyAddress: text("property_address"),
    propertyStatus: varchar("property_status", {
      enum: ["own", "rent", "lease"],
    }),
    propertyContacts: text("property_contacts"),
    propertyDocsLocation: text("property_docs_location"),
    // Other assets (checkboxes)
    hasStorageUnit: boolean("has_storage_unit"),
    hasSafeDepositBox: boolean("has_safe_deposit_box"),
    hasPOBox: boolean("has_po_box"),
    hasVehicles: boolean("has_vehicles"),
    otherAssetsDetails: text("other_assets_details"),
    otherAssetsAccessInfo: text("other_assets_access_info"),

    // ========================================================================
    // Section 6: Digital Life
    // ========================================================================
    usesPasswordManager: boolean("uses_password_manager"),
    passwordManagerName: text("password_manager_name"),
    masterPasswordLocation: text("master_password_location"),
    // Online accounts (checkboxes)
    hasEmailAccounts: boolean("has_email_accounts"),
    hasSocialMedia: boolean("has_social_media"),
    hasBankingApps: boolean("has_banking_apps"),
    hasStreamingSubscriptions: boolean("has_streaming_subscriptions"),
    hasWorkAccounts: boolean("has_work_accounts"),
    hasCloudStorage: boolean("has_cloud_storage"),
    loginInfoLocation: text("login_info_location"),
    accountsToDelete: text("accounts_to_delete"),
    accountsToMemorialize: text("accounts_to_memorialize"),

    // ========================================================================
    // Section 7: Ongoing Responsibilities
    // ========================================================================
    hasUtilityPayments: boolean("has_utility_payments"),
    hasSubscriptionPayments: boolean("has_subscription_payments"),
    hasInsurancePayments: boolean("has_insurance_payments"),
    hasCharitableDonations: boolean("has_charitable_donations"),
    paymentMethod: text("payment_method"),

    // ========================================================================
    // Section 8: Healthcare & Medical
    // ========================================================================
    primaryDoctorName: text("primary_doctor_name"),
    primaryDoctorPhone: text("primary_doctor_phone"),
    criticalMedications: text("critical_medications"),
    majorHealthConditions: text("major_health_conditions"),
    preferredHospital: text("preferred_hospital"),
    organDonationPreference: varchar("organ_donation_preference", {
      enum: ["yes", "no", "family_decides"],
    }),

    // ========================================================================
    // Section 9: End-of-Life Preferences
    // ========================================================================
    hasFuneralArrangements: boolean("has_funeral_arrangements"),
    funeralHomeProvider: text("funeral_home_provider"),
    arrangementPaperworkLocation: text("arrangement_paperwork_location"),
    serviceTypePreference: varchar("service_type_preference", {
      enum: ["funeral", "memorial", "celebration", "private", "no_preference"],
    }),
    finalArrangementPreference: varchar("final_arrangement_preference", {
      enum: ["burial", "cremation", "green_burial", "no_preference"],
    }),
    religiousSpiritualNotes: text("religious_spiritual_notes"),
    obituaryKeyPoints: text("obituary_key_points"),
    preferredCharities: text("preferred_charities"),

    // ========================================================================
    // Section 10: Special Items & People
    // ========================================================================
    hasSpecificItemsForPeople: boolean("has_specific_items_for_people"),
    specificItemsDocLocation: text("specific_items_doc_location"),
    // People to notify (JSON or structured)
    personToNotify1Name: text("person_to_notify_1_name"),
    personToNotify1Relationship: text("person_to_notify_1_relationship"),
    personToNotify1Contact: text("person_to_notify_1_contact"),
    personToNotify2Name: text("person_to_notify_2_name"),
    personToNotify2Relationship: text("person_to_notify_2_relationship"),
    personToNotify2Contact: text("person_to_notify_2_contact"),
    // Work contacts
    employerName: text("employer_name"),
    hrBenefitsContact: text("hr_benefits_contact"),

    // ========================================================================
    // Section 11: Final Details
    // ========================================================================
    spareKeysLocation: text("spare_keys_location"),
    carKeysLocation: text("car_keys_location"),
    safeSecurityCodeHint: text("safe_security_code_hint"),
    additionalInformation: text("additional_information"),
    // Backup copies
    backupPerson1: text("backup_person_1"),
    backupPerson2: text("backup_person_2"),
    backupLocation: text("backup_location"),

    // ========================================================================
    // Metadata
    // ========================================================================
    currentStep: integer("current_step").notNull().default(1),
    isComplete: boolean("is_complete").notNull().default(false),
    completedAt: timestamp("completed_at"),
    lastEditedAt: timestamp("last_edited_at"),

    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("pre_need_survey_response_survey_id_idx").on(table.surveyId),
  ]
);

// ============================================================================
// Survey Audit Log Table (tracks status changes and edits)
// ============================================================================

export const PreNeedSurveyAuditLogTable = pgTable(
  "pre_need_survey_audit_log",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => PreNeedSurveyTable.id, { onDelete: "cascade" }),

    // Actor information
    actorType: varchar("actor_type", {
      enum: ["owner", "client", "org_admin", "system"],
    }).notNull(),
    actorId: text("actor_id"), // userId or null for client
    actorName: text("actor_name"),

    // Action details
    action: varchar("action", {
      enum: [
        "created",
        "shared",
        "response_saved",
        "submitted",
        "status_changed",
        "locked",
        "unlocked",
        "approved",
        "converted_to_entry",
      ],
    }).notNull(),

    // Additional context
    previousStatus: varchar("previous_status", { enum: SURVEY_STATUSES }),
    newStatus: varchar("new_status", { enum: SURVEY_STATUSES }),
    metadata: text("metadata"), // JSON for additional context

    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("pre_need_survey_audit_log_survey_id_idx").on(table.surveyId),
    index("pre_need_survey_audit_log_created_at_idx").on(table.createdAt),
  ]
);

// ============================================================================
// Relations
// ============================================================================

export const PreNeedSurveyRelations = relations(
  PreNeedSurveyTable,
  ({ one, many }) => ({
    owner: one(UserTable, {
      fields: [PreNeedSurveyTable.userId],
      references: [UserTable.id],
    }),
    entry: one(EntryTable, {
      fields: [PreNeedSurveyTable.entryId],
      references: [EntryTable.id],
    }),
    statusChanger: one(UserTable, {
      fields: [PreNeedSurveyTable.statusChangedBy],
      references: [UserTable.id],
      relationName: "statusChanger",
    }),
    locker: one(UserTable, {
      fields: [PreNeedSurveyTable.lockedBy],
      references: [UserTable.id],
      relationName: "locker",
    }),
    shareLink: one(ShareLinkTable, {
      fields: [PreNeedSurveyTable.shareLinkId],
      references: [ShareLinkTable.id],
    }),
    responses: many(PreNeedSurveyResponseTable),
    auditLogs: many(PreNeedSurveyAuditLogTable),
  })
);

export const PreNeedSurveyResponseRelations = relations(
  PreNeedSurveyResponseTable,
  ({ one }) => ({
    survey: one(PreNeedSurveyTable, {
      fields: [PreNeedSurveyResponseTable.surveyId],
      references: [PreNeedSurveyTable.id],
    }),
  })
);

export const PreNeedSurveyAuditLogRelations = relations(
  PreNeedSurveyAuditLogTable,
  ({ one }) => ({
    survey: one(PreNeedSurveyTable, {
      fields: [PreNeedSurveyAuditLogTable.surveyId],
      references: [PreNeedSurveyTable.id],
    }),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type PreNeedSurvey = typeof PreNeedSurveyTable.$inferSelect;
export type PreNeedSurveyInsert = typeof PreNeedSurveyTable.$inferInsert;
export type PreNeedSurveyResponse = typeof PreNeedSurveyResponseTable.$inferSelect;
export type PreNeedSurveyResponseInsert =
  typeof PreNeedSurveyResponseTable.$inferInsert;
export type PreNeedSurveyAuditLog = typeof PreNeedSurveyAuditLogTable.$inferSelect;

// Combined types for queries
export interface PreNeedSurveyWithResponse extends PreNeedSurvey {
  responses: PreNeedSurveyResponse[];
}

export interface PreNeedSurveyAccessResult {
  survey: PreNeedSurvey;
  response: PreNeedSurveyResponse | null;
  role: "owner" | "org_admin" | "client";
  canView: boolean;
  canEdit: boolean;
  canLock: boolean;
  canApprove: boolean;
}
