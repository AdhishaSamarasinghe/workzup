"use client";

import Dropdown from "./Dropdown";
import KeywordDropdown from "./KeywordDropdown";
import DatePicker from "./DatePicker";


interface Props {
  keywords: string[];
  keyword: string;
  setKeyword: (value: string) => void;
  district: string;
  setDistrict: (value: string) => void;
  pay: string;
  setPay: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const payRanges = ["$10-$20", "$20-$30", "$30-$40", "$40+"];

export default function SearchBar({
  keywords,
  keyword,
  setKeyword,
  district,
  setDistrict,
  pay,
  setPay,
  date,
  setDate,
  onSearch,
  onClear,
}: Props) {

  const clearFilters = () => {
    onClear();
  };

  // We can also trigger a search immediately on clear if desired,
  // or let the user click search. Often 'Clear' implies reset and search.
  // Let's defer that decision or maybe just reset UI for now.
  // If we want to reset results, we should probably call onSearch() or have a separate onClear().
  // For now, let's just reset the state. The user can click Search to refresh if they want,
  // or we can auto-submit. Let's auto-submit for better UX?
  // Actually, normally 'Clear' just clears inputs. But if we want `page.tsx` to refetch all,
  // we need to signal it.
  // However, since state is lifted, `page.tsx` will see empty strings.
  // If `page.tsx` has a useEffect on these vars, it would trigger.
  // But we are using a manual "Search" button.
  // So let's just clear. The user will have to click Search again to get all jobs?
  // That's a bit annoying. Let's make the Search button click required.


  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm md:flex-row md:flex-wrap md:items-center">

      {/* Keyword */}
      <div className="w-full md:w-[240px] md:flex-1">
        <KeywordDropdown
          keywords={keywords}
          value={keyword}
          onChange={setKeyword}
        />
      </div>

      {/* Location */}
      <div className="w-full md:w-[200px]">
        <Dropdown
          label="Select District"
          options={districts}
          value={district}
          onChange={setDistrict}
        />
      </div>

      {/* Pay */}
      <div className="w-full md:w-[150px]">
        <Dropdown
          label="Pay Range"
          options={payRanges}
          value={pay}
          onChange={setPay}
        />
      </div>

      {/* Date */}
      <div className="w-full md:w-[160px]">
        <DatePicker value={date} onChange={setDate} />
      </div>

      <div className="flex w-full gap-3 md:w-auto">
        <button
          onClick={onSearch}
          className="flex-1 rounded-xl bg-[#6b8bff] px-6 py-2.5 text-sm text-white transition hover:scale-[1.03] md:flex-none"
        >
          Search
        </button>

        <button
          onClick={clearFilters}
          className="rounded-xl px-4 py-2.5 text-sm text-gray-500 transition hover:bg-slate-50 hover:text-gray-700"
        >
          Clear
        </button>
      </div>
    </section>
  );
}
