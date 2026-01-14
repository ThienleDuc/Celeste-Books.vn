import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxPagesToShow = 10,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  // Tạo mảng trang cần hiển thị
  const generatePages = (): (number | string)[] => {
    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả trang
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    // Luôn hiển thị trang đầu
    pages.push(1);
    
    // Tính toán khoảng trang hiển thị
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    
    // Điều chỉnh nếu gần đầu hoặc cuối
    if (currentPage <= 3) {
      end = 5;
    }
    
    if (currentPage >= totalPages - 2) {
      start = totalPages - 4;
    }
    
    // Thêm dấu "..." nếu cần
    if (start > 2) {
      pages.push("...");
    }
    
    // Thêm các trang ở giữa
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Thêm dấu "..." nếu cần
    if (end < totalPages - 1) {
      pages.push("...");
    }
    
    // Luôn hiển thị trang cuối
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = generatePages();

  // Xử lý chuyển trang
  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      onPageChange(page);
    }
  };

  // Xử lý Previous
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Xử lý Next
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
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
            aria-disabled={currentPage === 1}
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>

        {/* Các nút số trang */}
        {pages.map((page, index) => {
          const key = page === "..." ? `dots-${index}` : `page-${page}`;
          const isActive = page === currentPage;
          
          if (page === "...") {
            return (
              <li key={key} className="page-item disabled">
                <span className="page-link" aria-hidden="true">...</span>
              </li>
            );
          }
          
          return (
            <li
              key={key}
              className={`page-item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <button
                className="page-link"
                onClick={() => handlePageClick(page)}
                aria-label={`Go to page ${page}`}
              >
                {page}
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
            aria-disabled={currentPage === totalPages}
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
      
      {/* Hiển thị thông tin (tùy chọn) */}
      <div className="text-center text-muted small mt-2">
        Trang {currentPage} / {totalPages} • {totalItems} sản phẩm
      </div>
    </nav>
  );
};

export default Pagination;