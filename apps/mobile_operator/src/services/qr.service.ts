import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';

class QRService {
  async validateQR(qrToken: string, tripId: string): Promise<any> {
    return await apiClient.post<any>(
      API_ENDPOINTS.QR.VALIDATE,
      { qrToken, tripId },
      true
    );
  }
}

export default new QRService();
