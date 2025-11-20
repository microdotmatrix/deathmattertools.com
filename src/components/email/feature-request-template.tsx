import { meta } from "@/lib/config";
import {
    Button,
    Container,
    Heading,
    Hr,
    Html,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";

interface FeatureRequestEmailProps {
  request: string;
  email: string;
  roles: string[];
}

export const FeatureRequestTemplate = ({ request, email, roles }: FeatureRequestEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Container className="mx-auto my-[40px] max-w-[640px] border border-border rounded-md p-[20px]">
          <Heading className="text-center mb-[12px] text-[24px] font-semibold text-black">
            New Feature Request - {meta.title}
          </Heading>
          <Section className="my-[12px]">
            <Text className="text-[14px] text-gray-500 italic">
              Submitted By:
            </Text>
            <Text className="text-[16px] text-black">
              <strong>Email:</strong> {email}
            </Text>
            <Text className="text-[16px] text-black">
              <strong>Role(s):</strong> {roles.join(", ")}
            </Text>
          </Section>
          <Hr />
          <Section className="my-[12px]">
            <Text className="text-[14px] text-gray-500 italic">Feature Request:</Text>
            <Text className="text-[16px] text-black">{request}</Text>
          </Section>
          <Section className="mt-[24px]">
            <Button
              href={`mailto:${email}`}
              className="w-full px-[20px] py-[12px] text-[16px] font-semibold text-white bg-black rounded-md text-center"
            >
              Reply to {email}
            </Button>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
};
