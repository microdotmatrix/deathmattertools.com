"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateOrganizationDetails,
  type OrganizationDetailsState,
} from "@/lib/db/mutations/organization-details";
import type { OrganizationDetails } from "@/lib/db/schema/organizations";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

interface OrganizationDetailsFormProps {
  initialDetails: OrganizationDetails | null;
  organizationName: string;
  isAdmin: boolean;
}

const businessTypes = [
  { value: "funeral_home", label: "Funeral Home" },
  { value: "cemetery", label: "Cemetery" },
  { value: "hospice", label: "Hospice" },
  { value: "crematorium", label: "Crematorium" },
  { value: "memorial_service", label: "Memorial Service Provider" },
  { value: "grief_counseling", label: "Grief Counseling" },
  { value: "other", label: "Other" },
];

export function OrganizationDetailsForm({
  initialDetails,
  organizationName,
  isAdmin,
}: OrganizationDetailsFormProps) {
  const [state, formAction, isPending] = useActionState<OrganizationDetailsState, FormData>(
    updateOrganizationDetails,
    {}
  );
  const [businessType, setBusinessType] = useState(initialDetails?.businessType || "");

  useEffect(() => {
    if (state.success) {
      toast.success("Organization details updated successfully");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Alert>
          <Icon icon="mdi:shield-lock" className="h-4 w-4" />
          <AlertDescription>
            Only organization administrators can edit organization details.
          </AlertDescription>
        </Alert>

        {/* Read-only Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:office-building" className="w-5 h-5" aria-hidden="true" />
              Business Information
            </CardTitle>
            <CardDescription>
              Details about your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Business Name</dt>
                <dd className="text-sm">{initialDetails?.businessName || organizationName}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Business Type</dt>
                <dd className="text-sm">
                  {businessTypes.find((t) => t.value === initialDetails?.businessType)?.label || "Not specified"}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Business Email</dt>
                <dd className="text-sm">{initialDetails?.businessEmail || "Not specified"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Business Phone</dt>
                <dd className="text-sm">{initialDetails?.businessPhone || "Not specified"}</dd>
              </div>
              <div className="space-y-1 md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Website URL</dt>
                <dd className="text-sm">
                  {initialDetails?.websiteUrl ? (
                    <a
                      href={initialDetails.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {initialDetails.websiteUrl}
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Read-only Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:map-marker" className="w-5 h-5" aria-hidden="true" />
              Address
            </CardTitle>
            <CardDescription>
              Your organization&apos;s physical address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">Street Address</dt>
                <dd className="text-sm">
                  {initialDetails?.addressLine1 || "Not specified"}
                  {initialDetails?.addressLine2 && (
                    <>
                      <br />
                      {initialDetails.addressLine2}
                    </>
                  )}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">City</dt>
                <dd className="text-sm">{initialDetails?.city || "Not specified"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">State / Province</dt>
                <dd className="text-sm">{initialDetails?.state || "Not specified"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Postal Code</dt>
                <dd className="text-sm">{initialDetails?.postalCode || "Not specified"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                <dd className="text-sm">{initialDetails?.country || "Not specified"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Read-only Legal & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:file-document" className="w-5 h-5" aria-hidden="true" />
              Legal &amp; Compliance
            </CardTitle>
            <CardDescription>
              Licensing and tax information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">License Number</dt>
                <dd className="text-sm">{initialDetails?.licenseNumber || "Not specified"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Tax ID / EIN</dt>
                <dd className="text-sm">{initialDetails?.taxId || "Not specified"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:office-building" className="w-5 h-5" aria-hidden="true" />
            Business Information
          </CardTitle>
          <CardDescription>
            Details about your organization that will be used across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={initialDetails?.businessName || organizationName}
                placeholder="Legal or DBA name"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use your organization name: {organizationName}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                name="businessType"
                defaultValue={initialDetails?.businessType || ""}
                onValueChange={setBusinessType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="businessType" value={businessType} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                name="businessEmail"
                type="email"
                defaultValue={initialDetails?.businessEmail || ""}
                placeholder="contact@example.com"
              />
              {state.fieldErrors?.businessEmail && (
                <p className="text-xs text-destructive">{state.fieldErrors.businessEmail[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                name="businessPhone"
                type="tel"
                defaultValue={initialDetails?.businessPhone || ""}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                defaultValue={initialDetails?.websiteUrl || ""}
                placeholder="https://www.example.com"
              />
              {state.fieldErrors?.websiteUrl && (
                <p className="text-xs text-destructive">{state.fieldErrors.websiteUrl[0]}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:map-marker" className="w-5 h-5" aria-hidden="true" />
            Address
          </CardTitle>
          <CardDescription>
            Your organization's physical address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                defaultValue={initialDetails?.addressLine1 || ""}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                defaultValue={initialDetails?.addressLine2 || ""}
                placeholder="Suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={initialDetails?.city || ""}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={initialDetails?.state || ""}
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  defaultValue={initialDetails?.postalCode || ""}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="space-y-2 md:w-1/3">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={initialDetails?.country || ""}
                placeholder="United States"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:file-document" className="w-5 h-5" aria-hidden="true" />
            Legal & Compliance
          </CardTitle>
          <CardDescription>
            Optional licensing and tax information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                defaultValue={initialDetails?.licenseNumber || ""}
                placeholder="Business license number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                name="taxId"
                defaultValue={initialDetails?.taxId || ""}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Icon icon="mdi:content-save" className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <Icon icon="mdi:alert-circle" className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
