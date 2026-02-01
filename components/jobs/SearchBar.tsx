"use client";

import Dropdown from "./Dropdown";

export default function SearchBar() {
  const inputStyle =
    "bg-gray-50 rounded-xl px-4 py-2 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b8bff] hover:scale-[1.02] min-w-[200px]";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap gap-4 items-end">

      {/* Job Keyword */}
      <div className="flex flex-col flex-1 min-w-36">
        <span className="text-xs text-gray-500 mb-1">
          Job Title / Keyword
        </span>
        <input
          placeholder="Event staff"
          className={inputStyle}
        />
      </div>

      {/* Location */}
      <div className="flex flex-col flex-1 min-w-36">
        <span className="text-xs text-gray-500 mb-1">
          Location
        </span>
        <input
          placeholder="City or ZIP code"
          className={inputStyle}
        />
      </div>

      {/* Available Time */}
        <div className="flex flex-col min-w-36">
        <span className="text-xs text-gray-500 mb-1">
            Filters
        </span>
        <button className="bg-gray-50 rounded-xl px-4 py-2 hover:scale-[1.02] transition flex justify-between items-center">
            Filters ⚙
        </button>
        </div>


      {/* Pay Range Dropdown */}
      <div className="flex flex-col min-w-36">
        <span className="text-xs text-gray-500 mb-1">
          Pay Range
        </span>
        <Dropdown
          label="Select"
          options={["$10-$20", "$20-$30", "$30-$40"]}
        />
      </div>

      {/* Date Picker */}
      <div className="flex flex-col min-w-36">
        <span className="text-xs text-gray-500 mb-1">
          Date
        </span>
        <input
          type="date"
          className="bg-gray-50 rounded-xl px-4 py-2 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b8bff] hover:scale-[1.02]"
        />
      </div>

      {/* Search Button */}
      <button className="bg-[#6b8bff] text-white px-8 py-2 rounded-xl transition duration-200 hover:scale-105 hover:shadow-md">
        Search
      </button>

    </div>
  );
}
