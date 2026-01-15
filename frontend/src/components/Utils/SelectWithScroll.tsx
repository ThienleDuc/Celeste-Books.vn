import React from "react";
import Select, { type SingleValue } from "react-select";

interface SelectWithScrollProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number;
  isDisabled?: boolean;
  className?: string; // 👈 THÊM className prop
}

const SelectWithScroll: React.FC<SelectWithScrollProps> = ({
  options,
  value,
  onChange,
  placeholder = "-- Chọn --",
  maxHeight = 150,
  isDisabled = false,
  className = "", // 👈 default empty string
}) => {
  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleChange = (selected: SingleValue<{ value: string; label: string }>) => {
    onChange(selected?.value || "");
  };

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable
      isDisabled={isDisabled}
      className={className} // 👈 TRUYỀN className vào React-Select
      classNamePrefix="react-select" // 👈 THÊM prefix để custom CSS dễ hơn
      styles={{
        menuList: (provided) => ({ ...provided, maxHeight }),
      }}
    />
  );
};

export default SelectWithScroll;