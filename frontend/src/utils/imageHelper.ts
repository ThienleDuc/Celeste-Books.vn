// src/utils/imageHelper.ts

const DEFAULT_AVATAR = '/img/linh_vat_logo.png';
const DEFAULT_PRODUCT = '/img/default-product.png';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Kiểm tra xem string có phải là URL hợp lệ không
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Lấy URL ảnh chính xác cho avatar hoặc sản phẩm
 */
const getImageUrl = (
  imageUrl: string | null | undefined, 
  type: 'avatar' | 'product'
): string => {
  const defaultImage = type === 'avatar' ? DEFAULT_AVATAR : DEFAULT_PRODUCT;
  
  // 1. Nếu không có URL → default
  if (!imageUrl || imageUrl.trim() === '') {
    return defaultImage;
  }

  const url = imageUrl.trim();

  // 2. Nếu đã là URL backend (8000) → giữ nguyên
  if (url.includes('localhost:8000') || url.includes(BACKEND_URL)) {
    return url;
  }

  // 3. Nếu là URL frontend (5173) → chuyển thành 8000
  if (url.includes('localhost:5173')) {
    return url.replace('localhost:5173', 'localhost:8000');
  }

  // 4. Nếu là URL hợp lệ khác (http/https) → giữ nguyên (CDN, external)
  if (isValidUrl(url) && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }

  // 5. Nếu chỉ là filename đơn giản (có đuôi ảnh, không có /)
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  const hasNoSlash = !url.includes('/');
  
  if (hasImageExtension && hasNoSlash) {
    const folder = type === 'avatar' ? 'avatars' : 'products';
    return `${BACKEND_URL}/storage/${folder}/${url}`;
  }

  // 6. Nếu là relative path với storage
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }

  // 7. Nếu là relative path không có slash đầu
  if (url.startsWith('storage/')) {
    return `${BACKEND_URL}/${url}`;
  }

  // 8. Nếu là đường dẫn tương đối (bắt đầu bằng /) nhưng không phải storage
  // Ví dụ: /img/product.jpg, /uploads/avatar.png
  if (url.startsWith('/') && hasImageExtension) {
    // Trường hợp này có thể là ảnh từ public folder
    // Giữ nguyên, frontend sẽ tự xử lý
    return url;
  }

  // 9. Nếu có đuôi ảnh nhưng không rõ cấu trúc (không có / ở đầu, không phải filename đơn)
  // Ví dụ: uploads/products/image.jpg, assets/avatar.png
  if (hasImageExtension && !url.startsWith('/') && url.includes('/')) {
    // Giả sử đây là relative path từ root của storage
    return `${BACKEND_URL}/storage/${url}`;
  }

  // 10. Mặc định: thêm backend URL nếu có vẻ là đường dẫn
  if (!url.startsWith('http') && (url.includes('/') || hasImageExtension)) {
    return `${BACKEND_URL}${url.startsWith('/') ? url : '/' + url}`;
  }

  // 11. Nếu không xác định được format → default
  console.warn('Không xác định được format ảnh:', url, '→ fallback to default');
  return defaultImage;
};

/**
 * Lấy URL avatar - LUÔN trả về URL port 8000
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  return getImageUrl(avatarUrl, 'avatar');
};

/**
 * Lấy URL ảnh sản phẩm - LUÔN trả về URL port 8000
 */
export const getProductImageUrl = (imageUrl: string | null | undefined): string => {
  return getImageUrl(imageUrl, 'product');
};

/**
 * Xử lý lỗi ảnh - Fallback về default
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  const target = e.target as HTMLImageElement;
  const failedUrl = target.src;
  
  console.warn('Image load failed:', failedUrl);
  
  // Xác định loại ảnh dựa trên src
  if (failedUrl.includes('avatars') || failedUrl.includes('avatar')) {
    target.src = DEFAULT_AVATAR;
  } else if (failedUrl.includes('products') || failedUrl.includes('product')) {
    target.src = DEFAULT_PRODUCT;
  } else {
    target.src = DEFAULT_AVATAR; // Fallback chung
  }
};

/**
 * Test function để debug
 */
export const testImageUrls = () => {
  const testCases = [
    // URLs hợp lệ
    'https://example.com/image.jpg',
    'http://cdn.example.com/avatar.png',
    'http://localhost:8000/storage/avatars/test.jpg',
    'http://localhost:5173/storage/products/test.png',
    
    // Filename đơn
    'test.jpg',
    'avatar.png',
    'product-image.webp',
    
    // Relative paths
    '/storage/avatars/test.jpg',
    'storage/products/test.png',
    '/img/product.jpg',
    '/uploads/avatar.png',
    'uploads/products/image.jpg',
    'assets/images/photo.jpeg',
    
    // Không hợp lệ
    '',
    null,
    undefined,
    'just-text',
    'no-extension/file',
  ];
  
  console.group('🧪 Image URL Tests');
  testCases.forEach((test, index) => {
    const avatarResult = getAvatarUrl(test);
    const productResult = getProductImageUrl(test);
    
    console.log(`Test ${index + 1}: ${test}`);
    console.log(`  Avatar: ${avatarResult}`);
    console.log(`  Product: ${productResult}`);
    console.log('---');
  });
  console.groupEnd();
};

export default {
  getAvatarUrl,
  getProductImageUrl,
  handleImageError,
  testImageUrls
};