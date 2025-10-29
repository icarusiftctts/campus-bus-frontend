import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private OPERATOR_TOKEN_KEY = '@operator_token';
  private OPERATOR_DATA_KEY = '@operator_data';

  async saveOperatorToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.OPERATOR_TOKEN_KEY, token);
  }

  async getOperatorToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.OPERATOR_TOKEN_KEY);
  }

  async saveOperatorData(data: any): Promise<void> {
    await AsyncStorage.setItem(this.OPERATOR_DATA_KEY, JSON.stringify(data));
  }

  async getOperatorData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(this.OPERATOR_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  async clearOperatorData(): Promise<void> {
    await AsyncStorage.multiRemove([this.OPERATOR_TOKEN_KEY, this.OPERATOR_DATA_KEY]);
  }
}

export default new StorageService();
