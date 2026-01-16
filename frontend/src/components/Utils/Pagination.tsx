import React, { useMemo, memo } from "react";

// --- INTERFACES ---
interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number; // Mặc định là 10 như code cũ
}

// --- UTILS ---
// Hàm tạo mảng số từ start -> end
const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const DOTS = "...";

// --- COMPONENT ---
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxPagesToShow = 10,
}) => {
  // 1. Tính toán tổng số trang
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 2. Tối ưu logic tạo dãy số trang bằng useMemo
  const paginationRange = useMemo(() => {
    // Nếu ít trang hơn giới hạn hiển thị, hiện tất cả
    if (totalPages <= maxPagesToShow) {
      return range(1, totalPages);
    }

    // Cấu hình số lượng page anh em (siblings) hiển thị cạnh trang hiện tại
    const siblingCount = 1; 

    // Tính toán giới hạn trái/phải
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Kiểm tra xem có cần hiện dấu "..." không
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // TRƯỜNG HỢP 1: Không hiện dots bên trái, chỉ hiện bên phải
    // Ví dụ: [1] 2 3 4 5 ... [100]
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount; // Tính toán số lượng item cố định
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // TRƯỜNG HỢP 2: Không hiện dots bên phải, chỉ hiện bên trái
    // Ví dụ: [1] ... 96 97 98 99 [100]
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // TRƯỜNG HỢP 3: Hiện dots cả 2 bên
    // Ví dụ: [1] ... 4 5 6 ... [100]
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    
    // Fallback (ít khi xảy ra với logic trên)
    return range(1, totalPages);

  }, [currentPage, maxPagesToShow, totalPages]);

  // Nếu không có trang nào hoặc chỉ 1 trang thì ẩn luôn
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mb-0">
        {/* Nút Previous */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Previous"
            style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>

        {/* Danh sách trang */}
        {paginationRange.map((pageNumber, index) => {
          // Render dấu "..."
          if (pageNumber === DOTS) {
            return (
              <li key={`dots-${index}`} className="page-item disabled">
                <span className="page-link border-0 bg-transparent text-muted">
                  &#8230;
                </span>
              </li>
            );
          }

          // Render số trang
          return (
            <li
              key={pageNumber}
              className={`page-item ${pageNumber === currentPage ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(pageNumber as number)}
                style={{ cursor: 'pointer' }}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* Nút Next */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="Next"
            style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>

      {/* Thông tin thống kê nhỏ gọn */}
      <div className="text-center text-muted small mt-2">
         Trang <b>{currentPage}</b> / {totalPages} — Tổng <b>{totalItems}</b>
      </div>
    </nav>
  );
};

// Sử dụng memo để tránh re-render khi parent re-render mà props không đổi
export default memo(Pagination);