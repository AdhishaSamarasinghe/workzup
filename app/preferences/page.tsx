import SkillsForm from "@/components/skills/SkillsForm";

export const metadata = {
  title: "Preferences - Workzup",
};

export default function PreferencesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 pb-12 px-4 sm:pt-28 sm:pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="mb-2 text-2xl font-extrabold underline decoration-accent decoration-2 underline-offset-4 sm:mb-3 sm:text-3xl sm:decoration-4 sm:underline-offset-8 md:text-4xl">
          Set Up Your Job Preferences
        </h1>
        <p className="text-sm text-muted max-w-xl mx-auto sm:text-base">
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
