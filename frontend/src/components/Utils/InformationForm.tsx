import React, { useState } from "react";

interface InformationFormProps {
    namelabel: string;
    name: string;
    type: string;
    value: string;
   
    
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean; // Thêm prop required để xác định trường bắt buộc
}

const InformationForm: React.FC<InformationFormProps> = ({
    namelabel,
    type,
    value,
    name,
    onChange,
    required = false // Mặc định là không bắt buộc
}) => {
    const dataSelect = ["Tư vấn online", "Chăm sóc khách hàng"];

    // 1. State quản lý trạng thái
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
   


    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
};

    

    // 2. Logic màu sắc - ĐÃ SỬA LỖI LOGIC
    const getBorderClass = () => {
        // TRƯỜNG HỢP 1: Đang focus -> Viền Xanh Đậm + Dày lên
        if (isFocused) {
            return "border-blue-600 bg-blue-50 border-2";
        }

        // TRƯỜNG HỢP 2: Lỗi (Đã blur và không có giá trị) -> Viền Đỏ
        // Chỉ hiển thị lỗi nếu trường này là bắt buộc
        if (isTouched && required && !value.trim()) {
            return "border-red-500 bg-red-50 border-2";
        }

        // TRƯỜNG HỢP 3: Có giá trị hợp lệ -> Viền Xanh Lá
        if (value && value.trim() !== "") {
            return "border-green-500 bg-green-50 border";
        }

        // Mặc định: Viền Xám
        return "border-gray-300 bg-white border";
    };

    // Class cơ bản
    const baseClasses = "w-full rounded-md px-3 py-2 outline-none transition-all duration-200 placeholder-gray-400";

    // Kiểm tra có hiển thị lỗi không
    const showError = required && isTouched && !value.trim() && !isFocused;

    return (
        <div className="mb-3 flex flex-col gap-1 text-gray-900">
            {type === "select" ? (
                <>
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`${baseClasses} ${getBorderClass()}`}
                    >
                        <option value="" disabled>
                            {namelabel}
                        </option>
                        {dataSelect.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    
                    {/* Thông báo lỗi cho select */}
                    {showError && (
                        <p className="text-red-500 text-sm mt-1">Vui lòng chọn {namelabel.toLowerCase()}</p>
                    )}
                </>
            ) : (
                <>
                    <input
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        placeholder={namelabel}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        
                        
                        className={`${baseClasses} ${getBorderClass()}`}
                    />
                    
                    {/* Thông báo lỗi cho input */}
                    {showError && (
                        <p className="text-red-500 text-sm mt-1">Vui lòng nhập {namelabel.toLowerCase()}</p>
                    )}
                </>
            )}
        </div>
    );
};

export default InformationForm;