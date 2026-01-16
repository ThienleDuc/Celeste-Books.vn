// src/utils/imageHelper.ts

const DEFAULT_AVATAR = '/img/linh_vat_logo.png';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const FRONTEND_URL = window.location.origin || 'http://localhost:5173';

/**
 * Kiểm tra URL có hợp lệ không
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Kiểm tra đuôi file ảnh
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  if (!hasImageExtension) return false;
  
  // Nếu là URL đầy đủ
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Chỉ chấp nhận backend URL (8000) hoặc frontend default URL (5173)
    const isBackendUrl = url.includes('localhost:8000') || url.includes(BACKEND_URL);
    const isFrontendUrl = url.includes('localhost:5173') || url.includes(FRONTEND_URL);
    
    // Nếu là frontend URL nhưng không phải ảnh default
    if (isFrontendUrl && !url.includes(DEFAULT_AVATAR)) {
      return false; // Không chấp nhận frontend URL cho avatar
    }
    
    return isBackendUrl || isFrontendUrl;
  }
  
  // Nếu là relative path (bắt đầu bằng /)
  if (url.startsWith('/')) {
    return true; // Chấp nhận relative path
  }
  
  return true; // Chấp nhận filename đơn thuần
};

/**
 * Trích xuất filename từ bất kỳ input nào
 */
const extractFilename = (input: string): string => {
  if (!input) return '';
  
  const cleaned = input.trim().replace(/\\/g, '');
  
  // Tách bằng /
  const parts = cleaned.split('/');
  
  // Tìm phần có đuôi file ảnh
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(part)) {
      return part;
    }
  }
  
  // Nếu không tìm thấy, lấy phần cuối cùng
  return parts[parts.length - 1] || '';
};

/**
 * Fix URL sai (chứa route frontend)
 */
const fixWrongUrl = (url: string): string => {
  // Nếu URL chứa route frontend sai
  if (url.includes('nguoi-dung/chinh-sua/avatars/')) {
    const filename = extractFilename(url);
    if (filename) {
      return `${BACKEND_URL}/storage/avatars/${filename}`;
    }
  }
  
  return url;
};

/**
 * Xử lý URL avatar
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  // 1. Nếu không có → default
  if (!avatarUrl || avatarUrl.trim() === '') {
    return DEFAULT_AVATAR;
  }

  const url = avatarUrl.trim().replace(/\\/g, '');
  
  if (import.meta.env.DEV) {
    console.log('🔍 Avatar input:', url);
  }

  // 2. Kiểm tra URL có hợp lệ không
  if (!isValidImageUrl(url)) {
    if (import.meta.env.DEV) {
      console.warn('❌ Invalid URL format:', url);
    }
    return DEFAULT_AVATAR;
  }

  // 3. Nếu là URL đầy đủ và hợp lệ → giữ nguyên
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Nếu là frontend URL (5173) nhưng không phải ảnh default
    if ((url.includes('localhost:5173') || url.includes(FRONTEND_URL)) && 
        !url.includes(DEFAULT_AVATAR)) {
      // Fix frontend URL thành backend URL
      const fixedUrl = fixWrongUrl(url);
      
      if (import.meta.env.DEV) {
        console.log('🔧 Fixed frontend URL to backend:', fixedUrl);
      }
      
      return fixedUrl !== url ? fixedUrl : DEFAULT_AVATAR;
    }
    
    return url; // Giữ nguyên backend URL hợp lệ
  }

  // 4. Trích xuất filename từ relative path
  const filename = extractFilename(url);
  
  if (!filename) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ No filename found:', url);
    }
    return DEFAULT_AVATAR;
  }
  
  // 5. Tạo URL đúng (backend URL)
  const finalUrl = `${BACKEND_URL}/storage/avatars/${filename}`;
  
  if (import.meta.env.DEV) {
    console.log('✅ Generated URL:', finalUrl);
  }
  
  return finalUrl;
};

/**
 * Xử lý lỗi ảnh - Kiểm tra và fix URL sai
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  const target = e.target as HTMLImageElement;
  const failedUrl = target.src;
  
  if (import.meta.env.DEV) {
    console.log('❌ Image load error:', failedUrl);
  }
  
  // Nếu URL bị sai (frontend URL cho avatar)
  if (failedUrl.includes('localhost:5173') && !failedUrl.includes(DEFAULT_AVATAR)) {
    // Thử fix URL
    const fixedUrl = fixWrongUrl(failedUrl);
    
    if (fixedUrl !== failedUrl && fixedUrl !== DEFAULT_AVATAR) {
      if (import.meta.env.DEV) {
        console.log('🔄 Retrying with fixed URL:', fixedUrl);
      }
      target.src = fixedUrl;
      return;
    }
  }
  
  // Dùng ảnh default
  target.src = DEFAULT_AVATAR;
};

/**
 * Test URL validation
 */
export const testUrlValidation = () => {
  const testCases = [
    // Valid URLs
    'Wkeilemzu131gc2OqOcX0IPZZIEMNo7DcEKUn46M.jpg',
    'avatars/Wkeilemzu131gc2OqOcX0IPZZIEMNo7DcEKUn46M.jpg',
    'storage/avatars/Wkeilemzu131gc2OqOcX0IPZZIEMNo7DcEKUn46M.jpg',
    'http://localhost:8000/storage/avatars/Wkeilemzu131gc2OqOcX0IPZZIEMNo7DcEKUn46M.jpg',
    '/img/linh_vat_logo.png',
    
    // Invalid URLs (should return default)
    'http://localhost:5173/nguoi-dung/chinh-sua/avatars/Wkeilemzu131gc2OqOcX0IPZZIEMNo7DcEKUn46M.jpg',
    'http://localhost:5173/some-other-path/image.jpg',
    'http://example.com/avatar.jpg',
    'data:image/jpeg;base64,...',
    'just-text-no-extension',
    null,
    '',
    undefined
  ];
  
  console.group('🧪 URL Validation Test');
  testCases.forEach(test => {
    const result = getAvatarUrl(test);
    const isValid = result !== DEFAULT_AVATAR;
    console.log(`Input: ${test}`);
    console.log(`Output: ${result}`);
    console.log(`Valid: ${isValid ? '✅' : '❌'}`);
    console.log('---');
  });
  console.groupEnd();
};

// Export
export default {
  getAvatarUrl,
  handleImageError,
  testUrlValidation
};