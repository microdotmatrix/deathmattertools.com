import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";

export default function FeedbackPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                title="Feedback"
                description="Share your feedback and suggestions for improvement."
            />
            <div className="space-y-6">
                <h2>Feedback</h2>
            </div>
        </DashboardShell>
    );
}