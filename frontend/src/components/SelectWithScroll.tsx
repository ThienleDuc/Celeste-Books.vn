import React from "react";
import Select, { type SingleValue } from "react-select";

interface SelectWithScrollProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number;
  isDisabled?: boolean; // thêm prop mới
}

const SelectWithScroll: React.FC<SelectWithScrollProps> = ({
  options,
  value,
  onChange,
  placeholder = "-- Chọn --",
  maxHeight = 150,
  isDisabled = false, // default false
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
      isDisabled={isDisabled} // truyền xuống react-select
      styles={{
        menuList: (provided) => ({ ...provided, maxHeight }),
      }}
    />
  );
};

export default SelectWithScroll;
