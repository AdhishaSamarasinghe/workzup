const jobData = {
  title: "Event Staff for Tech Conference",
  company: "Innovate Events Inc.",
  location: "Downtown Convention Center",
  jobType: "Full-time · On-site",
  posted: "2 days ago",
  pay: "$25/hour",
  tags: ["Event Support", "Customer Service", "Teamwork", "Communication", "Organization"],
};

export default function JobseekerApplyPage() {
  return (
    <div className="bg-[#F8FAFC]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                Job Apply
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827] sm:text-4xl">
                {jobData.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                <span className="font-medium text-[#111827]">{jobData.company}</span>
                <span className="h-1 w-1 rounded-full bg-[#CBD5F5]" />
                <span>{jobData.location}</span>
                <span className="h-1 w-1 rounded-full bg-[#CBD5F5]" />
                <span>{jobData.jobType}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#6B7280]">
              <div className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
                Pay Rate: <span className="font-semibold text-[#111827]">{jobData.pay}</span>
              </div>
              <div className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
                Posted: <span className="font-semibold text-[#111827]">{jobData.posted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-[#111827]">Job Description</h2>
              <p className="mt-3 text-sm leading-6 text-[#4B5563]">
                Join our team as an Event Staff member for the annual Tech Innovate Conference. You will
                assist attendees, manage registration desks, and provide general support to event
                organizers. We are looking for energetic and reliable individuals who thrive in fast-paced
                environments.
              </p>
              <h3 className="mt-6 text-base font-semibold text-[#111827]">Responsibilities</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#4B5563]">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6D83F2]" />
                  Check-in attendees and provide badges and event materials.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6D83F2]" />
                  Direct attendees to sessions, workshops, and facilities.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6D83F2]" />
                  Assist with setup and breakdown of event spaces.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6D83F2]" />
                  Answer questions and ensure a welcoming experience.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-[#111827]">Required Skills</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {jobData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm font-medium text-[#1F2937]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <section className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-[#111827]">Apply for this role</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Fill out the application form and upload your CV. We will review your details and get back to
              you soon.
            </p>

            <form className="mt-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-[#111827]">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#6D83F2] focus:outline-none focus:ring-2 focus:ring-[#6D83F2]/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#111827]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#6D83F2] focus:outline-none focus:ring-2 focus:ring-[#6D83F2]/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-[#111827]">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#6D83F2] focus:outline-none focus:ring-2 focus:ring-[#6D83F2]/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cv" className="text-sm font-medium text-[#111827]">
                  Upload CV
                </label>
                <label
                  htmlFor="cv"
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#CBD5F5] bg-[#F8FAFC] px-4 py-3 text-sm text-[#6B7280]"
                >
                  <span>Drag and drop or click to upload</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6D83F2]">
                    Browse
                  </span>
                </label>
                <input id="cv" name="cv" type="file" className="hidden" />
              </div>

              <div className="space-y-2">
                <label htmlFor="coverLetter" className="text-sm font-medium text-[#111827]">
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows={5}
                  placeholder="Write a short cover letter..."
                  className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#6D83F2] focus:outline-none focus:ring-2 focus:ring-[#6D83F2]/30"
                />
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-[#6D83F2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B73F1]"
              >
                Submit Application
              </button>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
