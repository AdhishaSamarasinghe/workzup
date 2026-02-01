import SkillsForm from "../components/SkillsForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold text-[#111827] sm:text-5xl">
          <span className="underline decoration-accent decoration-4 underline-offset-8">
            Set Up Your Job Preferences
          </span>
        </h1>
        <p className="text-lg text-muted">
          Personalize your profile to get the best job recommendations.
        </p>
      </div>

      {/* Skills Form Card */}
      <SkillsForm />
    </div>
  );
}
