import React from "react";

interface QuantitySelectorProps {
  id: string; 
  value: number;
  stock: number;
  onChange: (newValue: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  id,
  value,
  stock,
  onChange,
}) => {
  const increase = () => {
    if (value < stock) onChange(value + 1);
  };

  const decrease = () => {
    if (value > 1) onChange(value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 1;
    if (val < 1) val = 1;
    if (val > stock) val = stock;
    onChange(val);
  };

  return (
    <div className="quantity-section">
      <button onClick={decrease} type="button">-</button>
      {/* label ẩn cho accessibility */}
      <label htmlFor={id} className="visually-hidden">
        Số lượng
      </label>
      <input
        type="number"
        id={id}
        min={1}
        max={stock}
        value={value}
        onChange={handleInputChange}
        className="quantity-input"
      />
      <button onClick={increase} type="button">+</button>
    </div>
  );
};

export default QuantitySelector;
