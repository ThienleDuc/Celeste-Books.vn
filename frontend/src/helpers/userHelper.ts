// src/helpers/userHelper.ts
import type { UserMe } from '../api/auth.api';
import { authApi } from '../api/auth.api';

export const userHelper = {
  // Phương thức duy nhất - lấy user từ API bằng token trong localStorage
  async getUser(): Promise<UserMe | null> {
    try {
      // Lấy token
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      // Gọi API
      const response = await authApi.me();
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
};

export default userHelper;