export function formatDecimal(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "0";
  }

  // Làm tròn đến 1 chữ số thập phân
  let formatted = num.toFixed(1);

  // Bỏ .0 nếu có
  if (formatted.endsWith(".0")) {
    formatted = formatted.slice(0, -2);
  }

  // Tách phần nguyên và phần thập phân
  const [integerPart, decimalPart] = formatted.split(".");

  // Thêm dấu phẩy cho phần nguyên
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Ghép lại
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}
