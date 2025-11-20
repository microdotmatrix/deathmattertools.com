import { ContactSection } from "@/components/email/contact-form";
import { FeatureRequestForm } from "@/components/forms/feature-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const experimental_ppr = true;

export default function ContactPage() {
  return (
    <main>
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-12">
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              If you have any questions or need assistance, please don't hesitate to
              contact us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactSection />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Request</CardTitle>
            <CardDescription>
              Have an idea for a new feature? Tell us about it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureRequestForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}