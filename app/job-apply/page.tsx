"use client";

import Link from "next/link";

const jobDetails = {
  title: "Event Staff for Tech Conference",
  badge: "Urgent Hire",
  payRate: "RS 25/hour",
  location: "Downtown Convention Center",
  dateTime: "October 26, 2024, 9:00 AM - 5:00 PM",
  description:
    "Join our team as an Event Staff member for the annual Tech Innovate Conference. This one-day role is crucial for ensuring the smooth operation of the event. You will be responsible for assisting attendees, managing registration desks, and providing general support to event organizers. We are looking for energetic and reliable individuals who are excellent communicators and can work effectively in a fast-paced environment.",
  responsibilities: [
    "Check-in attendees and provide them with badges and event materials.",
    "Direct attendees to various sessions, workshops, and facilities.",
    "Assist with setup and breakdown of event spaces.",
    "Provide information and answer questions about the event schedule.",
    "Ensure a positive and welcoming atmosphere for all participants.",
  ],
  requirements: [
    "Previous experience in customer service or event support is a plus.",
    "Strong verbal communication and interpersonal skills.",
    "Ability to stand for extended periods and lift up to 30 lbs.",
    "Punctual, reliable, and professional demeanor.",
    "Must be available for the entire duration of the shift.",
  ],
  employer: {
    name: "Innovate Events Inc.",
  },
};

export default function JobApplyPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#111827]">
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold text-[#111827] sm:text-4xl">
              {jobDetails.title}
            </h1>
            <span className="rounded-full bg-[#E8F7F2] px-3 py-1 text-xs font-semibold text-[#0F766E]">
              {jobDetails.badge}
            </span>
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#E5E7EB] pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Pay Rate
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {jobDetails.payRate}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Location
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {jobDetails.location}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Date &amp; Time
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {jobDetails.dateTime}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold">Job Description</h2>
              <p className="mt-3 text-sm leading-6 text-[#4B5563]">
                {jobDetails.description}
              </p>

              <h3 className="mt-6 text-base font-semibold">Responsibilities</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#4B5563]">
                {jobDetails.responsibilities.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#6D83F2]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 text-base font-semibold">Requirements</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#4B5563]">
                {jobDetails.requirements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#6D83F2]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">
              <div className="space-y-3">
                <Link
                  href="/apply-form"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#6D83F2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B73F1]"
                >
                  Apply Now
                </Link>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#E5E7EB]"
                >
                  Save Job
                </button>
                <p className="text-center text-xs text-[#6B7280]">
                  3 spots left! Application closes in 2 hours.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-semibold">About the Employer</h3>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F3F4F6] text-sm font-semibold text-[#6B7280]">
                  IE
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {jobDetails.employer.name}
                  </p>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#6D83F2] hover:underline"
                  >
                    View profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
