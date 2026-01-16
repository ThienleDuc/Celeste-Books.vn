// src/utils/phoneHelper.ts

/**
 * Format số điện thoại thành định dạng: 0 123 456 789
 * 
 * @param phone Số điện thoại (có thể là string hoặc number)
 * @returns Số điện thoại đã format theo định dạng Việt Nam
 */
export const formatPhoneNumber = (phone: string | number | null | undefined): string => {
  // Xử lý các trường hợp null/undefined
  if (!phone && phone !== 0) {
    return '';
  }
  
  // Chuyển về string
  let phoneStr = String(phone);
  
  // Xóa tất cả ký tự không phải số
  phoneStr = phoneStr.replace(/\D/g, '');
  
  // Kiểm tra độ dài
  const length = phoneStr.length;
  
  if (length === 0) {
    return '';
  }
  
  // Format theo từng trường hợp
  if (length <= 3) {
    return phoneStr;
  }
  
  if (length <= 6) {
    return `${phoneStr.slice(0, 3)} ${phoneStr.slice(3)}`;
  }
  
  if (length <= 9) {
    return `${phoneStr.slice(0, 3)} ${phoneStr.slice(3, 6)} ${phoneStr.slice(6)}`;
  }
  
  if (length <= 10) {
    // Định dạng chuẩn Việt Nam: 0 123 456 789
    return `${phoneStr.slice(0, 3)} ${phoneStr.slice(3, 6)} ${phoneStr.slice(6, 9)} ${phoneStr.slice(9)}`;
  }
  
  // Nếu dài hơn 10 số, format 10 số đầu
  return `${phoneStr.slice(0, 3)} ${phoneStr.slice(3, 6)} ${phoneStr.slice(6, 9)} ${phoneStr.slice(9, 10)}`;
};

/**
 * Kiểm tra số điện thoại có hợp lệ không (đúng 10 số)
 * 
 * @param phone Số điện thoại cần kiểm tra
 * @returns true nếu hợp lệ, false nếu không
 */
export const isValidPhoneNumber = (phone: string | number | null | undefined): boolean => {
  if (!phone && phone !== 0) {
    return false;
  }
  
  const phoneStr = String(phone).replace(/\D/g, '');
  
  // Số điện thoại Việt Nam: 10 số, bắt đầu bằng 0
  return /^0[1-9]\d{8}$/.test(phoneStr);
};

/**
 * Xóa format để lấy số thuần (chỉ số)
 * 
 * @param formattedPhone Số điện thoại đã format
 * @returns Số điện thoại chỉ chứa số
 */
export const unformatPhoneNumber = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, '');
};

/**
 * Chuẩn hóa số điện thoại về dạng chỉ số (10 số)
 * 
 * @param phone Số điện thoại đầu vào
 * @returns Số điện thoại chuẩn hóa (10 số) hoặc rỗng nếu không hợp lệ
 */
export const normalizePhoneNumber = (phone: string | number | null | undefined): string => {
  if (!phone && phone !== 0) {
    return '';
  }
  
  let phoneStr = String(phone).replace(/\D/g, '');
  
  // Nếu bắt đầu bằng 84 (quốc gia VN), chuyển về 0
  if (phoneStr.startsWith('84') && phoneStr.length === 11) {
    phoneStr = '0' + phoneStr.slice(2);
  }
  
  // Nếu bắt đầu bằng +84, chuyển về 0
  if (phoneStr.startsWith('84') && phoneStr.length === 12) {
    phoneStr = '0' + phoneStr.slice(3);
  }
  
  // Kiểm tra độ dài
  if (phoneStr.length !== 10) {
    return '';
  }
  
  // Kiểm tra định dạng (bắt đầu bằng 0)
  if (!phoneStr.startsWith('0')) {
    return '';
  }
  
  return phoneStr;
};

/**
 * Format số điện thoại theo nhiều định dạng
 * 
 * @param phone Số điện thoại
 * @param format Định dạng: 'spaced', 'dashed', 'parentheses', 'international'
 * @returns Số điện thoại đã format
 */
export const formatPhoneNumberWithStyle = (
  phone: string | number | null | undefined,
  format: 'spaced' | 'dashed' | 'parentheses' | 'international' = 'spaced'
): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized) {
    return '';
  }
  
  const part1 = normalized.slice(0, 3);   // 0xx
  const part2 = normalized.slice(3, 6);   // xxx
  const part3 = normalized.slice(6, 8);   // xx
  const part4 = normalized.slice(8, 10);  // xx
  
  switch (format) {
    case 'spaced':
      return `${part1} ${part2} ${part3}${part4}`; // 0xx xxx xxxx
    case 'dashed':
      return `${part1}-${part2}-${part3}${part4}`; // 0xx-xxx-xxxx
    case 'parentheses':
      return `(${part1}) ${part2} ${part3}${part4}`; // (0xx) xxx xxxx
    case 'international':
      return `+84 ${part1.slice(1)} ${part2} ${part3}${part4}`; // +84 xx xxx xxxx
    default:
      return `${part1} ${part2} ${part3}${part4}`;
  }
};

/**
 * Mask số điện thoại để bảo mật (ví dụ: 0123 *** 789)
 * 
 * @param phone Số điện thoại
 * @param maskChar Ký tự dùng để mask (mặc định: '*')
 * @returns Số điện thoại đã mask
 */
export const maskPhoneNumber = (
  phone: string | number | null | undefined,
  maskChar: string = '*'
): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized || normalized.length !== 10) {
    return '';
  }
  
  const prefix = normalized.slice(0, 4); // 0xxx
  const suffix = normalized.slice(7, 10); // xxx
  const masked = maskChar.repeat(3); // ***
  
  return `${prefix} ${masked} ${suffix}`;
};

/**
 * So sánh 2 số điện thoại (có thể khác format)
 * 
 * @param phone1 Số điện thoại thứ nhất
 * @param phone2 Số điện thoại thứ hai
 * @returns true nếu 2 số giống nhau (sau khi chuẩn hóa)
 */
export const comparePhoneNumbers = (
  phone1: string | number | null | undefined,
  phone2: string | number | null | undefined
): boolean => {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  return normalized1 === normalized2 && normalized1 !== '';
};

// Export mặc định
export default {
  formatPhoneNumber,
  isValidPhoneNumber,
  unformatPhoneNumber,
  normalizePhoneNumber,
  formatPhoneNumberWithStyle,
  maskPhoneNumber,
  comparePhoneNumbers
};