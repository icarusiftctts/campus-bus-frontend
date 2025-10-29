import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';

class BookingService {
  async bookTrip(tripId: string): Promise<any> {
    return await apiClient.post<any>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      { tripId },
      true
    );
  }

  async getStudentBookings(): Promise<any[]> {
    const response = await apiClient.get<{ bookings: any[] }>(
      API_ENDPOINTS.BOOKINGS.GET_STUDENT,
      undefined,
      true
    );
    return response.bookings || [];
  }

  async getActiveBookings(): Promise<any[]> {
    const bookings = await this.getStudentBookings();
    return bookings.filter(b => ['CONFIRMED', 'WAITLIST', 'SCANNED'].includes(b.status));
  }
}

export default new BookingService();
