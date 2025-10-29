import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';
import storageService from './storage.service';

class OperatorService {
  async login(employeeId: string, password: string): Promise<any> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.OPERATOR.LOGIN,
      { employeeId, password },
      false
    );
    
    if (response.token) {
      await storageService.saveOperatorToken(response.token);
      await storageService.saveOperatorData({
        operatorId: response.operatorId,
        name: response.name,
        employeeId: response.employeeId,
      });
    }
    
    return response;
  }

  async getOperatorTrips(date: string): Promise<any[]> {
    return await apiClient.get<any[]>(
      API_ENDPOINTS.OPERATOR.GET_TRIPS,
      { date },
      true
    );
  }

  async startTrip(tripId: string): Promise<any> {
    return await apiClient.post<any>(
      API_ENDPOINTS.OPERATOR.START_TRIP,
      { tripId },
      true
    );
  }

  async getPassengerList(tripId: string): Promise<any[]> {
    return await apiClient.get<any[]>(
      `${API_ENDPOINTS.OPERATOR.GET_PASSENGERS}/${tripId}/passengers`,
      undefined,
      true
    );
  }

  async submitReport(reportData: {
    tripId: string;
    studentId: string;
    incidentType: string;
    description: string;
    photoBase64?: string;
  }): Promise<any> {
    return await apiClient.post<any>(
      API_ENDPOINTS.OPERATOR.SUBMIT_REPORT,
      reportData,
      true
    );
  }

  async updateGPS(tripId: string, latitude: number, longitude: number): Promise<void> {
    await apiClient.post<void>(
      API_ENDPOINTS.OPERATOR.UPDATE_GPS,
      { tripId, latitude, longitude },
      true
    );
  }

  async logout(): Promise<void> {
    await storageService.clearOperatorData();
  }
}

export default new OperatorService();
