// Trip Service
// Connects to: GetAvailableTripsHandler

import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';
import { Trip, GetTripsRequest } from './api.types';

class TripService {
  // Get available trips for a route and date
  // → GET /api/trips/available?route=X&date=Y → GetAvailableTripsHandler
  async getAvailableTrips(request: GetTripsRequest): Promise<Trip[]> {
    const params = {
      route: request.route,
      date: request.tripDate,
    };

    const response = await apiClient.get<Trip[]>(
      API_ENDPOINTS.TRIPS.AVAILABLE,
      params,
      true // Requires authentication
    );

    let trips = response;
      if (typeof response === 'string') {
          try {
              trips = JSON.parse(response);
          } catch (e) {
              console.error('Failed to parse trips response:', e);
              return [];
          }
      }

      if (!Array.isArray(trips)) {
          console.error('Trips response is not an array:', trips);
          return [];
      }

      return trips as Trip[];
  }

  // Transform backend trip data to frontend format
  transformTripForUI(trip: Trip) {
    const isFull = trip.availableSeats <= 0;

    return {
      id: trip.tripId,
      time: this.formatTime(trip.departureTime),
      destination: trip.destination,
      busNumber: trip.busNumber,
      availableSeats: trip.availableSeats,
      totalSeats: trip.capacity - trip.facultyReserved,
      status: isFull ? 'Bus Full' : 'Booking Open',
      waitlistCount: trip.waitlistCount,
      tripId: trip.tripId,
      route: trip.route,
      tripDate: trip.tripDate,
      departureTime: trip.departureTime,
    };
  }

  // Format time from 24h to 12h format
  private formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Get trips for today or tomorrow
  async getTripsForDate(
    route: 'CAMPUS_TO_CITY' | 'CITY_TO_CAMPUS',
    daysFromNow: number = 0
  ): Promise<any[]> {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const tripDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

    const trips = await this.getAvailableTrips({ route, tripDate });
      if (!Array.isArray(trips)) {
          console.error('getAvailableTrips did not return an array:', trips);
          return [];
      }
    return trips.map(trip => this.transformTripForUI(trip));
  }
}

export default new TripService();
