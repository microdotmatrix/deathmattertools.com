"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { useMetaColor } from "@/hooks/use-meta-color";
import { meta } from "@/lib/config";
import { updateUserSettings } from "@/lib/db/mutations/user-settings";
import { UserSettingsWithDefaults } from "@/lib/db/queries/user-settings";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface UserSettingsFormProps {
  initialSettings: UserSettingsWithDefaults;
}

export function UserSettingsForm({ initialSettings }: UserSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState(initialSettings);
  const [mounted, setMounted] = useState(false);
  // Theme is managed by next-themes cookie, not database
  const { theme: currentTheme, setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  // Prevent hydration flash
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPending) {
      toast.loading("Saving settings...");
    } else {
      toast.dismiss();
    }
  }, [isPending]);

  // Theme change uses next-themes directly (no database save)
  const handleThemeChange = (theme: string) => {
    if (!mounted) return;
    
    // Update UI theme immediately via next-themes
    setTheme(theme);
    
    // Update meta color to prevent flash
    const effectiveTheme = theme === "system" ? resolvedTheme : theme;
    const metaColor = effectiveTheme === "dark" ? meta.colors.dark : meta.colors.light;
    setMetaColor(metaColor);
    
    toast.success("Theme updated");
  };

  const handleToggleChange = (field: "notifications" | "cookies", value: boolean) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    // Auto-save toggle change (only notifications and cookies go to database)
    startTransition(async () => {
      const formData = new FormData();
      formData.append("notifications", newSettings.notifications ? "on" : "off");
      formData.append("cookies", newSettings.cookies ? "on" : "off");
      const result = await updateUserSettings({ error: "", success: false }, formData);
      if (result.success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    });
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: "mdi:weather-sunny" },
    { value: "dark", label: "Dark", icon: "mdi:weather-night" },
    { value: "system", label: "System", icon: "mdi:desktop-mac" },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Settings - uses next-themes cookie, not database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:palette" className="w-5 h-5" aria-hidden="true" />
            Theme Preference
          </CardTitle>
          <CardDescription>
            Choose how the interface should appear for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                disabled={!mounted}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors",
                  "hover:border-primary/50 hover:bg-muted/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  mounted && currentTheme === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
                aria-label={`Select ${option.label} theme`}
                aria-pressed={mounted && currentTheme === option.value}
              >
                <Icon icon={option.icon} className="w-6 h-6 mb-2" />
                <span className="font-medium">{option.label}</span>
                {mounted && currentTheme === option.value && (
                  <div className="absolute top-2 right-2">
                    <Icon icon="mdi:check-circle" className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:bell" className="w-5 h-5" aria-hidden="true" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications from the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:email" className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your memorials via email.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifications}
              onClick={() => handleToggleChange("notifications", !settings.notifications)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                settings.notifications ? "bg-primary" : "bg-input"
              )}
              aria-label="Toggle email notifications"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                  settings.notifications ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <input
              type="hidden"
              name="notifications"
              value={settings.notifications ? "on" : "off"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cookie Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cookie" className="w-5 h-5" aria-hidden="true" />
            Cookie Consent
          </CardTitle>
          <CardDescription>
            Manage your privacy preferences for cookies and tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:shield-check" className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="cookies" className="font-medium">
                  Accept Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to use cookies to improve your experience.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.cookies}
              onClick={() => handleToggleChange("cookies", !settings.cookies)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                settings.cookies ? "bg-primary" : "bg-input"
              )}
              aria-label="Toggle cookie consent"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                  settings.cookies ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <input
              type="hidden"
              name="cookies"
              value={settings.cookies ? "on" : "off"}
            />
          </div>
        </CardContent>
      </Card>

      {isPending && (
        <Alert>
          <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
          <AlertDescription>Saving settings...</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
