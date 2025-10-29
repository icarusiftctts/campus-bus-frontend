import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  STUDENT_ID: 'student_id',
  USER_EMAIL: 'user_email',
  USER_PROFILE: 'user_profile',
};

class StorageService {
  async storeAuthData(token: string, studentId: string, email: string): Promise<void> {
    await AsyncStorage.multiSet([
      [KEYS.AUTH_TOKEN, token],
      [KEYS.STUDENT_ID, studentId],
      [KEYS.USER_EMAIL, email],
    ]);
  }

  async getAuthData(): Promise<{ token: string | null; studentId: string | null; email: string | null }> {
    const values = await AsyncStorage.multiGet([KEYS.AUTH_TOKEN, KEYS.STUDENT_ID, KEYS.USER_EMAIL]);
    return {
      token: values[0][1],
      studentId: values[1][1],
      email: values[2][1],
    };
  }

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.STUDENT_ID, KEYS.USER_EMAIL, KEYS.USER_PROFILE]);
  }

  async storeUserProfile(profile: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  async getUserProfile(): Promise<any> {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  }

  async getStudentId(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.STUDENT_ID);
  }
}

export default new StorageService();
