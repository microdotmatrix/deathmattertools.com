"use client";

import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PreNeedSurvey, PreNeedSurveyResponse } from "@/lib/db/schema";
import { SURVEY_STATUS_CONFIG } from "@/lib/survey-status/config";
import {
  lockSurveyAction,
  unlockSurveyAction,
  approveSurveyAction,
  updateSurveyStatusAction,
} from "@/actions/pre-need-survey";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

interface SurveyDetailViewProps {
  survey: PreNeedSurvey;
  response: PreNeedSurveyResponse | null;
  subjectName: string;
  role: "owner" | "org_admin";
  canEdit: boolean;
  canLock: boolean;
  canApprove: boolean;
}

export function SurveyDetailView({
  survey,
  response,
  subjectName,
  role,
  canEdit,
  canLock,
  canApprove,
}: SurveyDetailViewProps) {
  const [isPending, startTransition] = useTransition();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const config = SURVEY_STATUS_CONFIG[survey.status];

  const handleLock = async () => {
    startTransition(async () => {
      const result = await lockSurveyAction(survey.id, {}, new FormData());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Survey locked");
      }
    });
  };

  const handleUnlock = async () => {
    startTransition(async () => {
      const result = await unlockSurveyAction(survey.id, {}, new FormData());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Survey unlocked");
      }
    });
  };

  const handleApprove = async () => {
    startTransition(async () => {
      const result = await approveSurveyAction(survey.id, {}, new FormData());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Survey approved and data imported to entry");
      }
      setShowApproveDialog(false);
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    const formData = new FormData();
    formData.append("status", newStatus);

    startTransition(async () => {
      const result = await updateSurveyStatusAction(survey.id, {}, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    });
  };

  const copyShareLink = () => {
    if (survey.shareToken) {
      const url = `${window.location.origin}/survey/${survey.shareToken}`;
      navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/${survey.entryId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon icon="mdi:arrow-left" className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{subjectName}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
              <Icon icon={config.icon} className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
            {survey.isLocked && (
              <span className="flex items-center gap-1">
                <Icon icon="mdi:lock" className="h-4 w-4" />
                Locked
              </span>
            )}
            <span>
              Created{" "}
              {formatDistanceToNow(new Date(survey.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {survey.shareToken && (
            <Button variant="outline" onClick={copyShareLink}>
              <Icon icon="mdi:content-copy" className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          )}

          {canLock && (
            <>
              {survey.isLocked ? (
                <Button
                  variant="outline"
                  onClick={handleUnlock}
                  disabled={isPending}
                >
                  <Icon icon="mdi:lock-open" className="mr-2 h-4 w-4" />
                  Unlock
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLock}
                  disabled={isPending}
                >
                  <Icon icon="mdi:lock" className="mr-2 h-4 w-4" />
                  Lock
                </Button>
              )}
            </>
          )}

          {canApprove && (
            <Button onClick={() => setShowApproveDialog(true)} disabled={isPending}>
              <Icon icon="mdi:check-circle" className="mr-2 h-4 w-4" />
              Approve & Import
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="responses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="details">Survey Details</TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4">
          {response ? (
            <SurveyResponseView response={response} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon
                  icon="mdi:clipboard-text-off-outline"
                  className="mx-auto h-12 w-12 text-muted-foreground/50"
                />
                <h3 className="mt-4 text-lg font-semibold">No responses yet</h3>
                <p className="text-muted-foreground mt-2">
                  The client hasn't submitted any responses to this survey yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium">{config.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Locked</span>
                  <p className="font-medium">{survey.isLocked ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">
                    {format(new Date(survey.createdAt), "PPP")}
                  </p>
                </div>
                {survey.sharedAt && (
                  <div>
                    <span className="text-muted-foreground">Shared</span>
                    <p className="font-medium">
                      {format(new Date(survey.sharedAt), "PPP")}
                    </p>
                  </div>
                )}
                {survey.completedAt && (
                  <div>
                    <span className="text-muted-foreground">Completed</span>
                    <p className="font-medium">
                      {format(new Date(survey.completedAt), "PPP")}
                    </p>
                  </div>
                )}
                {survey.entryId && (
                  <div>
                    <span className="text-muted-foreground">Linked Entry</span>
                    <p>
                      <Link
                        href={`/${survey.entryId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        View Entry
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {survey.notes && (
                <div className="pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <p className="mt-1">{survey.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Survey & Import Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the survey and import the relevant fields to the
              linked entry. The survey will be locked after approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve & Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Component to display response data
function SurveyResponseView({ response }: { response: PreNeedSurveyResponse }) {
  const sections = [
    {
      title: "Basic Access Information",
      icon: "mdi:account",
      fields: [
        { label: "Full Name", value: response.fullName },
        { label: "Preferred Name", value: response.preferredName },
        { label: "Phone/Device Hint", value: response.phoneDeviceHint },
        { label: "Password Manager Hint", value: response.passwordManagerHint },
        { label: "Access Details Location", value: response.accessDetailsLocation },
      ],
    },
    {
      title: "Key Contacts",
      icon: "mdi:contacts",
      fields: [
        { label: "Emergency Contact Name", value: response.emergencyContactName },
        { label: "Emergency Contact Relationship", value: response.emergencyContactRelationship },
        { label: "Emergency Contact Phone", value: response.emergencyContactPhone },
        { label: "Emergency Contact Notes", value: response.emergencyContactNotes },
        { label: "Attorney Name", value: response.attorneyName },
        { label: "Attorney Phone", value: response.attorneyPhone },
        { label: "Financial Advisor Name", value: response.financialAdvisorName },
        { label: "Financial Advisor Phone", value: response.financialAdvisorPhone },
      ],
    },
    {
      title: "Documents & Financial",
      icon: "mdi:file-document",
      fields: [
        { label: "Has Will", value: response.hasWill },
        { label: "Will Location", value: response.willLocation },
        { label: "Will Attorney Name", value: response.willAttorneyName },
        { label: "Legal Docs Designated Person", value: response.legalDocsDesignatedPerson },
        { label: "Legal Docs Designated Phone", value: response.legalDocsDesignatedPhone },
        { label: "Legal Docs Location", value: response.legalDocsLocation },
        { label: "Funding Location", value: response.fundingLocation },
        { label: "Life Insurance Company", value: response.lifeInsuranceCompany },
        { label: "Life Insurance Policy Location", value: response.lifeInsurancePolicyLocation },
        { label: "Life Insurance Beneficiary", value: response.lifeInsuranceBeneficiary },
        { label: "Banks/Credit Unions", value: response.banksCreditUnions },
        { label: "Investment Accounts", value: response.investmentAccounts },
        { label: "Other Financial Accounts", value: response.otherFinancialAccounts },
        { label: "Account Details Location", value: response.accountDetailsLocation },
      ],
    },
    {
      title: "Property & Digital Life",
      icon: "mdi:home",
      fields: [
        { label: "Property Address", value: response.propertyAddress },
        { label: "Property Status", value: response.propertyStatus },
        { label: "Property Contacts", value: response.propertyContacts },
        { label: "Property Docs Location", value: response.propertyDocsLocation },
        { label: "Other Assets Details", value: response.otherAssetsDetails },
        { label: "Other Assets Access Info", value: response.otherAssetsAccessInfo },
        { label: "Password Manager Name", value: response.passwordManagerName },
        { label: "Master Password Location", value: response.masterPasswordLocation },
        { label: "Login Info Location", value: response.loginInfoLocation },
        { label: "Accounts to Delete", value: response.accountsToDelete },
        { label: "Accounts to Memorialize", value: response.accountsToMemorialize },
        { label: "Payment Method", value: response.paymentMethod },
      ],
    },
    {
      title: "Healthcare & End-of-Life",
      icon: "mdi:medical-bag",
      fields: [
        { label: "Primary Doctor Name", value: response.primaryDoctorName },
        { label: "Primary Doctor Phone", value: response.primaryDoctorPhone },
        { label: "Critical Medications", value: response.criticalMedications },
        { label: "Major Health Conditions", value: response.majorHealthConditions },
        { label: "Preferred Hospital", value: response.preferredHospital },
        { label: "Organ Donation Preference", value: response.organDonationPreference },
        { label: "Funeral Home/Provider", value: response.funeralHomeProvider },
        { label: "Arrangement Paperwork Location", value: response.arrangementPaperworkLocation },
        { label: "Service Type Preference", value: response.serviceTypePreference },
        { label: "Final Arrangement Preference", value: response.finalArrangementPreference },
        { label: "Religious/Spiritual Notes", value: response.religiousSpiritualNotes },
        { label: "Obituary Key Points", value: response.obituaryKeyPoints },
        { label: "Preferred Charities", value: response.preferredCharities },
      ],
    },
    {
      title: "Special Items & Final Details",
      icon: "mdi:gift",
      fields: [
        { label: "Specific Items Doc Location", value: response.specificItemsDocLocation },
        { label: "Person to Notify 1 Name", value: response.personToNotify1Name },
        { label: "Person to Notify 1 Relationship", value: response.personToNotify1Relationship },
        { label: "Person to Notify 1 Contact", value: response.personToNotify1Contact },
        { label: "Person to Notify 2 Name", value: response.personToNotify2Name },
        { label: "Person to Notify 2 Relationship", value: response.personToNotify2Relationship },
        { label: "Person to Notify 2 Contact", value: response.personToNotify2Contact },
        { label: "Employer Name", value: response.employerName },
        { label: "HR Benefits Contact", value: response.hrBenefitsContact },
        { label: "Spare Keys Location", value: response.spareKeysLocation },
        { label: "Car Keys Location", value: response.carKeysLocation },
        { label: "Safe/Security Code Hint", value: response.safeSecurityCodeHint },
        { label: "Additional Information", value: response.additionalInformation },
        { label: "Backup Person 1", value: response.backupPerson1 },
        { label: "Backup Person 2", value: response.backupPerson2 },
        { label: "Backup Location", value: response.backupLocation },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {response.isComplete && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <Icon icon="mdi:check-circle" className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Survey completed on{" "}
            {response.completedAt
              ? format(new Date(response.completedAt), "PPP")
              : "N/A"}
          </span>
        </div>
      )}

      {sections.map((section) => {
        const hasValues = section.fields.some((f) => f.value);
        if (!hasValues) return null;

        return (
          <Card key={section.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon icon={section.icon} className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {section.fields.map((field) =>
                  field.value ? (
                    <div key={field.label}>
                      <span className="text-muted-foreground">{field.label}</span>
                      <p className="font-medium whitespace-pre-wrap">{field.value}</p>
                    </div>
                  ) : null
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
