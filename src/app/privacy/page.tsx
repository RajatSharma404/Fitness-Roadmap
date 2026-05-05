import { Card, SectionHeader } from "@/components/shared/UIPrimitives";

export default function PrivacyPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Privacy"
          title="Privacy Notice"
          description="How this app stores planner and workout data."
        />
      </Card>

      <Card level="base" className="space-y-3 text-sm text-[#636380]">
        <p>
          Planner state may be stored in your browser local storage for fast
          offline-first recovery.
        </p>
        <p>
          When authenticated, selected data can be synced to server-side storage
          to preserve your training history.
        </p>
        <p>
          This project does not sell personal data and keeps feature access
          free.
        </p>
      </Card>
    </div>
  );
}
