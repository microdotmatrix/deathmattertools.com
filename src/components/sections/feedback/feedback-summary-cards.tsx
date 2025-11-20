import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Feedback } from "@/lib/types/feedback";
import { FeedbackStatus, FeedbackType } from "@/lib/types/feedback";

type FeedbackSummaryCardsProps = {
  feedback: Feedback[];
};

export const FeedbackSummaryCards = ({
  feedback,
}: FeedbackSummaryCardsProps) => {
  const newCount = feedback.filter(
    (item) => item.status === FeedbackStatus.NEW
  ).length;

  const contactCount = feedback.filter(
    (item) => item.type === FeedbackType.CONTACT
  ).length;

  const featureRequestCount = feedback.filter(
    (item) => item.type === FeedbackType.FEATURE_REQUEST
  ).length;

  const bugCount = feedback.filter(
    (item) => item.type === FeedbackType.BUG
  ).length;

  const summaryCards = [
    {
      label: "New Items",
      value: newCount,
      icon: "mdi:alert-circle-outline",
      description: "Requires attention",
    },
    {
      label: "Contact",
      value: contactCount,
      icon: "mdi:email-outline",
      description: "Contact messages",
    },
    {
      label: "Feature Requests",
      value: featureRequestCount,
      icon: "mdi:lightbulb-outline",
      description: "User suggestions",
    },
    {
      label: "Bugs",
      value: bugCount,
      icon: "mdi:bug-outline",
      description: "Issues reported",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-3xl font-semibold">{card.value}</p>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
              <div className="rounded-full bg-muted p-3">
                <Icon icon={card.icon} className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

