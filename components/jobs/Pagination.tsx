type Props = {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  setPage,
}: Props) {
  return (
    <div className="flex justify-center items-center gap-4 mt-10">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`w-8 h-8 rounded-full ${
            page === i + 1
              ? "bg-[#6b8bff] text-white"
              : ""
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
      </button>

    </div>
  );
}
