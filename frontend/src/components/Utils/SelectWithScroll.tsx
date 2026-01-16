import React, { useState, useRef, useEffect } from "react";
import Select, { type SingleValue, type StylesConfig } from "react-select";

interface SelectWithScrollProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number;
  isDisabled?: boolean;
  className?: string;
  pageSize?: number; // Thêm pageSize prop
}

const SelectWithScroll: React.FC<SelectWithScrollProps> = ({
  options,
  value,
  onChange,
  placeholder = "-- Chọn --",
  maxHeight = 150,
  isDisabled = false,
  className = "",
  pageSize = 5, // Default pageSize
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // Input tạm thời
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleChange = (selected: SingleValue<{ value: string; label: string }>) => {
    onChange(selected?.value || "");
    setIsSearchOpen(false);
  };

  // Tìm kiếm khi nhấn Enter hoặc nút tìm kiếm
  const handleSearchSubmit = () => {
    setSearchValue(searchInput);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Lọc options dựa trên searchValue
  const filteredOptions = searchValue 
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      )
    : options;

  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOptions = filteredOptions.slice(startIndex, startIndex + pageSize);

  // Mở overlay tìm kiếm
  const handleSearchClick = () => {
    if (isDisabled) return;
    setCurrentPage(1);
    setSearchInput(""); // Reset input tạm thời
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Xử lý điều hướng
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Đóng search overlay khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isSearchOpen]);

  // Reset khi đóng menu
  useEffect(() => {
    if (!isSearchOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchValue("");
      setSearchInput("");
      setCurrentPage(1);
    }
  }, [isSearchOpen]);

  // Custom styles
  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "46px",
      borderRadius: "10px",
      border: state.isFocused 
        ? "2px solid #3b82f6 !important"
        : "2px solid #e5e7eb !important",
      boxShadow: state.isFocused 
        ? "0 0 0 3px rgba(59, 130, 246, 0.1) !important"
        : "0 1px 3px 0 rgba(0, 0, 0, 0.05) !important",
      backgroundColor: isDisabled
        ? "#f9fafb !important"
        : "#ffffff !important",
      cursor: isDisabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease-in-out",
      display: "flex",
      alignItems: "center",
      "&:hover": {
        borderColor: isDisabled ? undefined : "#93c5fd !important",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 12px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280",
      fontSize: "0.875rem",
      fontWeight: 400,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827",
      fontSize: "0.875rem",
      fontWeight: 500,
    }),
    input: (provided) => ({
      ...provided,
      color: "#111827",
      fontSize: "0.875rem",
      margin: 0,
      padding: 0,
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#ffffff",
      overflow: "hidden",
      zIndex: 50,
      marginTop: "4px",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: `${maxHeight}px`,
      padding: 0,
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f3f4f6",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#d1d5db",
        borderRadius: "3px",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#eff6ff !important"
        : state.isFocused
        ? "#f3f4f6 !important"
        : "#ffffff !important",
      color: state.isSelected ? "#1d4ed8 !important" : "#374151 !important",
      fontSize: "0.875rem",
      fontWeight: state.isSelected ? 600 : 400,
      padding: "10px 16px",
      cursor: "pointer",
      transition: "all 0.15s ease",
      borderLeft: state.isSelected ? "3px solid #3b82f6" : "3px solid transparent",
    }),
    dropdownIndicator: () => ({
      display: "none",
    }),
    clearIndicator: () => ({
      display: "none",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Select
        options={paginatedOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isSearchable={false}
        isDisabled={isDisabled}
        classNamePrefix="custom-select"
        styles={customStyles}
        onMenuOpen={() => setIsSearchOpen(true)}
        onMenuClose={() => setIsSearchOpen(false)}
        menuIsOpen={isSearchOpen}
        components={{
          DropdownIndicator: () => null,
          IndicatorsContainer: () => null,
        }}
      />
      
      {/* Search button */}
      <button
        type="button"
        onClick={handleSearchClick}
        disabled={isDisabled}
        title="Tìm kiếm"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 disabled:opacity-50"
      >
        <i className="bi bi-search text-lg"></i>
      </button>
      
      {/* Navigation buttons khi search mở */}
      {isSearchOpen && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isDisabled}
            title="Trang trước"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 transition-all duration-200 disabled:opacity-50"
          >
            <i className="bi bi-chevron-up text-lg"></i>
          </button>
          <div className="text-xs text-gray-500 font-medium min-w-[20px] text-center">
            {currentPage}/{totalPages}
          </div>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isDisabled}
            title="Trang sau"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 transition-all duration-200 disabled:opacity-50"
          >
            <i className="bi bi-chevron-down text-lg"></i>
          </button>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-[100]">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="bi bi-search"></i>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập để tìm kiếm..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                title="Tìm kiếm"
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <i className="bi bi-search me-1"></i> Tìm
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                title="Đóng"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-all duration-200"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            {/* Options list */}
            <div className="max-h-[200px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {searchValue ? "Không tìm thấy kết quả" : "Nhập từ khóa để tìm kiếm"}
                </div>
              ) : (
                filteredOptions.slice(startIndex, startIndex + pageSize).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsSearchOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg mb-1 transition-all duration-150 ${
                      option.value === value 
                        ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200" 
                        : "text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent"
                    } last:mb-0`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>

            {/* Pagination info */}
            {filteredOptions.length > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, filteredOptions.length)} 
                  / {filteredOptions.length} kết quả
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    title="Trang trước"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200 transition-all duration-200 disabled:opacity-50"
                  >
                    <i className="bi bi-chevron-up"></i>
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200 transition-all duration-200 disabled:opacity-50"
                  >
                    <i className="bi bi-chevron-down"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectWithScroll;