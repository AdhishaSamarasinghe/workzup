type JobCardProps = {
  title: string;
  company: string;
  description: string;
  location: string;
  pay: string;
  date: string;
  onViewDetails?: () => void;
};

function shortenDescription(text: string, maxLength = 150) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export default function JobCard({
  title,
  company,
  description,
  location,
  pay,
  date,
  onViewDetails,
}: JobCardProps) {
  const previewDescription = shortenDescription(description);

  return (
    <div className="flex h-[460px] cursor-default flex-col overflow-hidden rounded-[26px] bg-white p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h2 className="max-w-[72%] text-[1.45rem] font-semibold leading-snug text-slate-900">
            {title}
          </h2>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            Urgent
          </span>
        </div>

        <p className="mt-2 text-[1.02rem] text-gray-500">{company}</p>

        <p
          className="mt-5 overflow-hidden text-base leading-8 text-gray-600"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          }}
        >
          {previewDescription}
        </p>
      </div>

      <div className="my-7 border-t border-gray-200"></div>

      <div className="space-y-3.5 text-[1.02rem] text-gray-600">
        <p>{location}</p>
        <p>{pay}</p>
        <p>{date}</p>
      </div>

      <div className="mt-auto flex justify-center pt-8 pb-1">
        <button
          onClick={onViewDetails}
          className="rounded-full bg-[#6b8bff] px-10 py-3 text-base text-white transition hover:opacity-90"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
