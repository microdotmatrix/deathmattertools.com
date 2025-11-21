import { PageHeading } from "@/components/elements/page-heading";
import { ReturnHome } from "@/components/elements/return-home";
import { LegalPageEditorInline } from "@/components/sections/legal/legal-page-editor-inline";
import { Card, CardContent } from "@/components/ui/card";
import { getPageContentBySlug } from "@/lib/db/queries/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy to understand how Death Matter Tools collects, uses, and protects your personal information.",
};

export const experimental_ppr = true;

export default async function Privacy() {
  const pageContent = await getPageContentBySlug("privacy");
  const lastUpdated = pageContent?.updatedAt ? new Date(pageContent.updatedAt).toLocaleDateString() : "";

  return (
    <main className="min-h-screen pb-32">
      {/* Header Section */}
      <PageHeading
        heading={pageContent?.title || "Privacy Policy"}
        subheading={pageContent?.updatedAt ? `Last Updated: ${lastUpdated}` : ""}
        padding="pt-12 pb-2"
      />

      {/* Privacy Content with Inline Editor */}
      <section className="py-4 px-4 md:px-6 max-w-5xl mx-auto">
        <Card className="bg-card/25 backdrop-blur-sm shadow-lg border-primary/10">
          <CardContent className="p-6 md:p-8">
            <LegalPageEditorInline
              slug="privacy"
              title={pageContent?.title || "Privacy Policy"}
              initialContent={pageContent?.content || ""}
            />
          </CardContent>
        </Card>
      </section>

      {/* Back to Home */}
      <section className="py-12 px-4 md:px-6 flex justify-center">
        <ReturnHome />
      </section>
    </main>
  );
}
