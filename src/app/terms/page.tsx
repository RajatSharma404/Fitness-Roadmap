import { Card, SectionHeader } from "@/components/shared/UIPrimitives";

export default function TermsPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Terms"
          title="Terms of Use"
          description="Short-form usage rules for this free planner application."
        />
      </Card>

      <Card level="base" className="space-y-3 text-sm text-[#636380]">
        <p>
          This app provides fitness planning guidance for educational purposes
          and does not replace professional medical advice.
        </p>
        <p>
          Use at your own discretion, train with safe form, and consult a
          qualified professional for injuries, medical conditions, or
          rehabilitation.
        </p>
        <p>
          By using this app, you agree not to misuse the platform or attempt
          unauthorized access to user data or systems.
        </p>
      </Card>
    </div>
  );
}
