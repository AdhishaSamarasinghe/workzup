import SkillsForm from "@/components/skills/SkillsForm";

export const metadata = {
  title: "Preferences - Workzup",
};

export default function PreferencesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="mb-3 text-3xl sm:text-4xl font-extrabold underline decoration-accent decoration-4 underline-offset-8">
          Set Up Your Job Preferences
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          Personalize your profile to get the best job recommendations.
        </p>
      </div>

      {/* SkillsForm card (self-contained) */}
      <div className="w-full flex justify-center">
        <SkillsForm />
      </div>
    </div>
  );
}
