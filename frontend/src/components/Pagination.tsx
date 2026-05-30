import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 3) {
        pages.push(0, 1, 2, 3, -1, totalPages - 1);
      } else if (currentPage > totalPages - 4) {
        pages.push(0, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push(0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1);
      }
    }
    return pages;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-x-0.5 hover:bg-slate-50 hover:text-[#E32A15] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
        {getPageNumbers().map((page, index) => {
          if (page === -1) {
            return (
              <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-slate-300">
                <MoreHorizontal size={16} />
              </span>
            );
          }

          const isActive = currentPage === page;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-black transition-all duration-300 ${
                isActive
                  ? "bg-[#E32A15] text-white shadow-md shadow-[#E32A15]/40"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-[#E32A15]"
              }`}
            >
              {page + 1}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:translate-x-0.5 hover:bg-slate-50 hover:text-[#E32A15] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Pagination;
