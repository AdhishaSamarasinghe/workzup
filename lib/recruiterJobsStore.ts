export type RecruiterJob = {
  id: string;
  recruiterId: string;
  title: string;
  postedDate: string; // ISO
  status: "Active" | "Completed" | "Expired";
  applicants: number;
  icon: string;
};

const defaultJobs: RecruiterJob[] = [
  {
    id: "j1",
    recruiterId: "default",
    title: "General Laborer",
    postedDate: new Date("2023-10-26").toISOString(),
    status: "Completed",
    applicants: 35,
    icon: "🔧",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __recruiterJobs: RecruiterJob[] | undefined;
}

function ensure() {
  if (!globalThis.__recruiterJobs) globalThis.__recruiterJobs = defaultJobs;
  return globalThis.__recruiterJobs;
}

export function getRecruiterJobs(recruiterId = "default") {
  return ensure()
    .filter((j) => j.recruiterId === recruiterId)
    .sort((a, b) => b.postedDate.localeCompare(a.postedDate)); // newest job first
}

export function addRecruiterJob(input: Omit<RecruiterJob, "id" | "postedDate">) {
  const all = ensure();
  const newJob: RecruiterJob = {
    ...input,
    id: crypto.randomUUID(),
    postedDate: new Date().toISOString(),
  };
  all.push(newJob);
  return getRecruiterJobs(input.recruiterId);
}
