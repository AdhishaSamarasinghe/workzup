import Header from "./components/Header";
import Footer from "./components/Footer";
import SkillsForm from "./components/SkillsForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 px-4">
        {/* Hero Section */}
        <div className="max-w-[var(--max-width)] mx-auto text-center mb-8">
          <h1 className="text-[2.5rem] font-bold mb-3 text-black">
            Set Up Your Job Preferences
          </h1>
          <p className="text-[var(--muted)] text-base">
            Personalize your profile to get the best job recommendations.
          </p>
        </div>

        {/* Form Section */}
        <SkillsForm />
      </main>

      <Footer />
    </div>
  );
}
