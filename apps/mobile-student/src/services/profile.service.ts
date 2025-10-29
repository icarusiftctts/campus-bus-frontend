import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';

export interface UserProfile {
  studentId: string;
  email: string;
  name: string;
  room: string;
  phone: string;
  penaltyCount: number;
  isBlocked: boolean;
  profileComplete: boolean;
}

export interface BookingHistory {
  bookingId: string;
  tripId: string;
  status: string;
  bookedAt: string;
  route: string;
  tripDate: string;
  departureTime: string;
}

class ProfileService {
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(
      API_ENDPOINTS.PROFILE.GET,
      undefined,
      true
    );
    return response;
  }

  async getBookingHistory(): Promise<BookingHistory[]> {
    const response = await apiClient.get<{ bookings: BookingHistory[] }>(
      API_ENDPOINTS.BOOKINGS.HISTORY,
      undefined,
      true
    );
    return response.bookings || [];
  }

  formatRoute(route: string): string {
    return route === 'CAMPUS_TO_CITY' ? 'Campus to City' : 'City to Campus';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  getPenaltyStatus(penaltyCount: number, isBlocked: boolean): { text: string; color: string } {
    if (isBlocked) {
      return { text: 'Blocked', color: '#dc3545' };
    }
    if (penaltyCount > 0) {
      return { text: `${penaltyCount} Penalties`, color: '#ffc107' };
    }
    return { text: 'No Dues', color: '#28a745' };
  }
}

export default new ProfileService();
