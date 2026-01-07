import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number; // tối đa số trang hiển thị cùng lúc
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxPagesToShow = 10,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; // Không hiển thị nếu chỉ có 1 trang

  const pages: (number | string)[] = [];

  if (totalPages <= maxPagesToShow) {
    // Nếu tổng trang <= maxPagesToShow, hiện tất cả
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Nếu tổng trang > maxPagesToShow, hiển thị dạng 1 ... mid ... last
    const firstPages = [1, 2, 3, 4, 5];
    const lastPages = [totalPages - 2, totalPages - 1, totalPages];

    if (currentPage <= 5) {
      pages.push(...firstPages, "...", ...lastPages);
    } else if (currentPage >= totalPages - 4) {
      pages.push(...firstPages, "...", ...lastPages);
    } else {
      // currentPage ở giữa
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous"
          >
            &laquo; {/* mũi tên trái */}
          </button>
        </li>

        {pages.map((page, idx) =>
          page === "..." ? (
            <li key={`dots-${idx}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li
              key={page}
              className={`page-item ${page === currentPage ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(Number(page))}>
                {page}
              </button>
            </li>
          )
        )}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next"
          >
            &raquo; {/* mũi tên phải */}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
