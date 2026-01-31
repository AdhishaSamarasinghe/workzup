import Header from "./components/Header";
import Footer from "./components/Footer";
import SkillsForm from "./components/SkillsForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6">
        {/* Hero Section */}
        <div className="max-w-[var(--max-width)] mx-auto text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold mb-2 sm:mb-3 text-black leading-tight">
            Set Up Your Job Preferences
          </h1>
          <p className="text-[var(--muted)] text-sm sm:text-base px-2 sm:px-0">
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
