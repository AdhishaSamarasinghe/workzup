type JobCardProps = {
  title: string;
  company: string;
  description: string;
  location: string;
  pay: string;
  date: string;
};

export default function JobCard({
  title,
  company,
  description,
  location,
  pay,
  date,
}: JobCardProps) {
  return (
    <div className="bg-white rounded-2xl p-7 flex flex-col justify-between h-[400px] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default">

      {/* Header */}
      <div>
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold leading-snug max-w-[75%]">
            {title}
          </h2>

          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
            Urgent
          </span>
        </div>

        <p className="text-gray-500 mt-2">
          {company}
        </p>

        <p className="text-gray-600 mt-4 leading-relaxed text-sm">
          {description}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Job Info */}
      <div className="space-y-3 text-gray-600 text-sm">

        <p>📍 {location}</p>
        <p>💵 {pay}</p>
        <p>📅 {date}</p>

      </div>

      {/* Button */}
      <div className="flex justify-center mt-6">
        <button className="bg-[#6b8bff] text-white px-10 py-2 rounded-full text-sm hover:opacity-90 transition">

          View Details
        </button>
      </div>

    </div>
  );
}
