"use client";

import { useState } from "react";
import Dropdown from "./Dropdown";
import KeywordDropdown from "./KeywordDropdown";
import DatePicker from "./DatePicker";


interface Props {
  keywords: string[];
  keyword: string;
  setKeyword: (value: string) => void;
}

const districts = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
  "Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
  "Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya",
  "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

const payRanges = ["$10-$20", "$20-$30", "$30-$40", "$40+"];

export default function SearchBar({
  keywords,
  keyword,
  setKeyword,
}: Props) {
  const [district, setDistrict] = useState("");
  const [pay, setPay] = useState("");
  const [date, setDate] = useState("");

  const clearFilters = () => {
    setKeyword("");
    setDistrict("");
    setPay("");
    setDate("");
  };

  return (
    <section className="bg-white rounded-2xl px-3 py-3 shadow-sm flex gap-4 items-center">

      {/* Keyword */}
      <div className="w-[240px]">
        <KeywordDropdown
          keywords={keywords}
          value={keyword}
          onChange={setKeyword}
        />
      </div>

      {/* Location */}
      <div className="w-[200px]">
        <Dropdown
          label="Select District"
          options={districts}
          value={district}
          onChange={setDistrict}
        />
      </div>

      {/* Pay */}
      <div className="w-[150px]">
        <Dropdown
          label="Pay Range"
          options={payRanges}
          value={pay}
          onChange={setPay}
        />
      </div>

      {/* Date */}
      <div className="w-[160px]">
      <DatePicker value={date} onChange={setDate} />
      </div>

      {/* Search button */}
      <button className="bg-[#6b8bff] text-white rounded-xl px-6 py-2.5 text-sm hover:scale-[1.03] transition">
        Search
      </button>

      {/* Clear */}
      <button
        onClick={clearFilters}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Clear
      </button>
    </section>
  );
}
