// apps/mobile-student/src/features/student/HomeDashboard.tsx

// @ts-ignore
import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import BookingModal from './BookingModal';
import Sidebar from '../../components/layout/Sidebar';
import Icon from 'react-native-vector-icons/Ionicons';
import {tripService, bookingService} from '../../services';

// --- Utility function to check if a trip is in the past ---
const isTripInPast = (tripTime: string, activeDate: 'today' | 'tomorrow'): boolean => {
    // Current date/time
    const now = new Date();

    // Parse the trip time string (e.g., "4:00 PM")
    // Assuming tripTime is in "H:MM A" format (e.g., "4:00 PM")
    const [time, period] = tripTime.split(' ');
    let [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0; // Midnight case
    }

    // Create a date object for the trip
    let tripDate = new Date();

    // Set the date based on activeDate ('today' or 'tomorrow')
    if (activeDate === 'tomorrow') {
        tripDate.setDate(now.getDate() + 1);
    }
    // If activeDate is 'today', the date is already set to today.

    // Set the time for the trip date object
    tripDate.setHours(hours, minutes, 0, 0);

    // Only compare if the activeDate is 'today'.
    // Trips scheduled for tomorrow cannot be in the past relative to now.
    if (activeDate === 'today' && tripDate.getTime() < now.getTime()) {
        return true;
    }

    return false;
};

const Header = ({onMenuClick, onProfileClick}) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onMenuClick}>
            <Icon name="menu" size={32} color="#007bff"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Connect</Text>
        <TouchableOpacity onPress={onProfileClick}>
            <Icon name="person-circle-outline" size={32} color="#007bff"/>
        </TouchableOpacity>
    </View>
);

// This TripCard replaces the separate TripCard.tsx logic,
// integrating status and past-time checks.
const TripCard = ({time, destination, busNumber, availableSeats, totalSeats, status, waitlistCount, onPress, activeDate}) => {
    // 1. Determine if the trip is in the past
    const isPastTrip = isTripInPast(time, activeDate);

    const isBusFull = status === 'Bus Full';
    const isBookingSoon = status === 'Booking Opens Soon';

    // Booking is only actionable if it is 'Booking Open' or 'Bus Full' AND NOT in the past
    const isActionable = (status === 'Booking Open' || isBusFull) && !isPastTrip;

    let badgeText = status;
    let badgeStyle = styles.statusBadge; // Default: Green for 'Booking Open'

    if (isPastTrip) {
        // New logic: Past trips get a grey badge style and "Expired" text
        badgeText = 'Expired';
        badgeStyle = styles.statusBadgeExpired;
    } else if (isBusFull) {
        badgeText = 'Join Waitlist';
        badgeStyle = styles.statusBadgeWaitlist; // Orange
    } else if (isBookingSoon) {
        badgeText = 'Booking Soon';
        badgeStyle = styles.statusBadgeSoon; // Grey for "Soon"
    }

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            // Disable if not actionable (Expired, Booking Soon, or some other non-bookable status)
            disabled={!isActionable}
            activeOpacity={isActionable ? 0.7 : 1.0} // Disable visual feedback if not clickable
        >
            <View>
                <Text style={styles.cardTime}>{time} → {destination}</Text>
                <Text style={styles.cardBus}>Bus #{busNumber}</Text>
                <Text style={styles.cardSeats}>
                    {isBusFull
                        ? `${waitlistCount} students on waitlist`
                        : `${availableSeats} / ${totalSeats} seats available`}
                </Text>
            </View>
            <View style={badgeStyle}>
                <Text style={styles.statusBadgeText}>{badgeText}</Text>
            </View>
        </TouchableOpacity>
    );
}

interface HomeDashboardProps {
    onGoToProfile: () => void;
    onBookTrip: (tripDetails: any) => void;
    onGoToMyTrip: () => void;
    onGoToTripHistory: () => void;
    onGoToFeedback: () => void;
    onLogout: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
                                                         onGoToProfile,
                                                         onBookTrip,
                                                         onGoToMyTrip,
                                                         onGoToTripHistory,
                                                         onGoToFeedback,
                                                         onLogout,
                                                     }) => {
    // Updated type for activeDate
    const [activeRoute, setActiveRoute] = useState('campusToCity');
    const [activeDate, setActiveDate] = useState<'today' | 'tomorrow'>('today');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [trips, setTrips] = useState({
        campusToCity: {today: [], tomorrow: []},
        cityToCampus: {today: [], tomorrow: []}
    });
    const [loading, setLoading] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeBookingRoute, setActiveBookingRoute] = useState<string | null>(null);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => {
        return date.toLocaleDateString('en-US', options);
    };

    const checkActiveBookings = async () => {
        try {
            const bookings = await bookingService.getActiveBookings();
            if (bookings && bookings.length > 0) {
                const activeBooking = bookings[0];
                setActiveBookingRoute(activeBooking.route);

                if (activeBooking.route === 'CAMPUS_TO_CITY') {
                    setActiveRoute('cityToCampus');
                } else {
                    setActiveRoute('campusToCity');
                }
            } else {
                setActiveBookingRoute(null);
            }
        } catch (error) {
            console.error('Error checking active bookings:', error);
        }
    };

    useEffect(() => {
        checkActiveBookings();
    }, []);

    const fetchTrips = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const route = activeRoute === 'campusToCity' ? 'CAMPUS_TO_CITY' : 'CITY_TO_CAMPUS';
            const daysFromNow = activeDate === 'today' ? 0 : 1;

            const fetchedTrips = await tripService.getTripsForDate(route, daysFromNow);

            setTrips(prev => ({
                ...prev,
                [activeRoute]: {
                    ...prev[activeRoute],
                    [activeDate]: fetchedTrips,
                },
            }));
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load trips');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [activeRoute, activeDate]);

    const onRefresh = () => {
        checkActiveBookings();
        fetchTrips(true);
    };

    const handleTripPress = (trip: any) => {
        // Check past time before opening modal
        const isPastTrip = isTripInPast(trip.time, activeDate);
        if (isPastTrip) {
            return; // Do nothing if trip is in the past
        }

        const routeText = activeRoute === 'campusToCity' ? 'Campus to City' : 'City to Campus';
        const dateText = activeDate === 'today'
            ? formatDate(today, {month: 'long', day: 'numeric', year: 'numeric'})
            : formatDate(tomorrow, {month: 'long', day: 'numeric', year: 'numeric'});

        const tripDetails = {
            time: trip.time,
            date: dateText,
            route: routeText,
            isWaitlist: trip.status === 'Bus Full',
            tripId: trip.tripId,
        };

        setSelectedTrip(tripDetails);
        setIsModalVisible(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedTrip || !selectedTrip.tripId) return;

        setBookingInProgress(true);
        try {
            const response = await bookingService.bookTrip(selectedTrip.tripId);

            setIsModalVisible(false);
            setSelectedTrip(null);

            if (response.status === 'CONFIRMED') {
                Alert.alert('Success', response.message || 'Booking confirmed!');
            } else if (response.status === 'WAITLIST') {
                Alert.alert(
                    'Added to Waitlist',
                    `You are #${response.position} on the waitlist. ${response.message}`
                );
            }

            await checkActiveBookings();
            fetchTrips();

            if (onBookTrip) {
                onBookTrip(selectedTrip);
            }
        } catch (error: any) {
            Alert.alert('Booking Failed', error.message || 'Unable to complete booking');
        } finally {
            setBookingInProgress(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedTrip(null);
    };

    const tripsToShow = trips?.[activeRoute]?.[activeDate] || [];

    const showCampusToCity = !activeBookingRoute || activeBookingRoute === 'CITY_TO_CAMPUS';
    const showCityToCampus = !activeBookingRoute || activeBookingRoute === 'CAMPUS_TO_CITY';

    return (
        <SafeAreaView style={styles.page}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onGoToMyTrip={onGoToMyTrip}
                onGoToTripHistory={onGoToTripHistory}
                onGoToFeedback={onGoToFeedback}
                onLogout={onLogout}
            />
            <Header
                onMenuClick={() => setSidebarOpen(true)}
                onProfileClick={onGoToProfile}
            />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007bff']}
                        tintColor="#007bff"
                    />
                }
            >
                <View style={styles.tabsContainer}>
                    {showCampusToCity && (
                        <TouchableOpacity
                            style={[styles.tab, activeRoute === 'campusToCity' && styles.activeTab, !showCityToCampus && styles.fullWidthTab]}
                            onPress={() => setActiveRoute('campusToCity')}>
                            <Text style={[styles.tabText, activeRoute === 'campusToCity' && styles.activeTabText]}>
                                Campus → City
                            </Text>
                        </TouchableOpacity>
                    )}
                    {showCityToCampus && (
                        <TouchableOpacity
                            style={[styles.tab, activeRoute === 'cityToCampus' && styles.activeTab, !showCampusToCity && styles.fullWidthTab]}
                            onPress={() => setActiveRoute('cityToCampus')}>
                            <Text style={[styles.tabText, activeRoute === 'cityToCampus' && styles.activeTabText]}>
                                City → Campus
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.dateSelector}>
                    <TouchableOpacity
                        style={[styles.dateButton, activeDate === 'today' && styles.activeDateButton]}
                        onPress={() => setActiveDate('today')}>
                        <Text style={[styles.dateButtonText, activeDate === 'today' && styles.activeDateButtonText]}>
                            Today ({formatDate(today, {month: 'short', day: 'numeric'})})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.dateButton, activeDate === 'tomorrow' && styles.activeDateButton]}
                        onPress={() => setActiveDate('tomorrow')}>
                        <Text style={[styles.dateButtonText, activeDate === 'tomorrow' && styles.activeDateButtonText]}>
                            Tomorrow ({formatDate(tomorrow, {month: 'short', day: 'numeric'})})
                        </Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007bff"/>
                            <Text style={styles.loadingText}>Loading trips...</Text>
                        </View>
                    ) : tripsToShow.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Icon name="bus-outline" size={64} color="#dee2e6" />
                            <Text style={styles.emptyText}>No trips available for this date</Text>
                            <TouchableOpacity
                                style={styles.reloadButton}
                                onPress={fetchTrips}
                            >
                                <Icon name="refresh" size={20} color="#007bff" />
                                <Text style={styles.reloadButtonText}>Reload</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        tripsToShow.map(trip => (
                            <TripCard
                                key={trip.tripId}
                                time={trip.time}
                                destination={trip.destination} // Assuming destination exists in trip object
                                busNumber={trip.busNumber} // Assuming busNumber exists in trip object
                                availableSeats={trip.availableSeats}
                                totalSeats={trip.totalSeats}
                                status={trip.status}
                                waitlistCount={trip.waitlistCount}
                                onPress={() => handleTripPress(trip)}
                                // 👇 PASS THE ACTIVE DATE HERE
                                activeDate={activeDate}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            <BookingModal
                visible={isModalVisible}
                tripDetails={selectedTrip}
                onConfirm={handleConfirmBooking}
                onClose={handleCloseModal}
                loading={bookingInProgress}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f7faff'},
    content: {paddingHorizontal: 20},
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 25,
        backgroundColor: '#f7faff'
    },
    headerTitle: {fontSize: 20, fontWeight: 'bold'},
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 5,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2
    },
    tab: {flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8},
    fullWidthTab: {flex: 1},
    activeTab: {backgroundColor: 'rgba(0, 123, 255, 0.1)'},
    tabText: {fontWeight: '600', color: '#6c757d', fontSize: 16},
    activeTabText: {color: '#007bff'},
    dateSelector: {flexDirection: 'row', gap: 15, marginVertical: 25},
    dateButton: {
        flex: 1,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    activeDateButton: {backgroundColor: '#007bff', borderColor: '#007bff'},
    dateButtonText: {fontSize: 14, fontWeight: '600', color: '#495057'},
    activeDateButtonText: {color: 'white'},
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    cardTime: {fontSize: 18, fontWeight: 'bold'},
    cardBus: {fontSize: 14, color: '#6c757d', marginTop: 2},
    cardSeats: {fontSize: 14, color: '#6c757d', marginTop: 2},
    statusBadge: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#28a745'},
    statusBadgeWaitlist: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fd7e14'},
    statusBadgeSoon: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#6c757d'},
    // 👇 NEW STYLE: Gray for expired/past trips
    statusBadgeExpired: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#adb5bd'},
    statusBadgeText: {color: 'white', fontWeight: '600', fontSize: 12},
    loadingContainer: {paddingVertical: 40, alignItems: 'center'},
    loadingText: {marginTop: 10, color: '#6c757d', fontSize: 14},
    emptyContainer: {paddingVertical: 40, alignItems: 'center'},
    emptyText: {color: '#6c757d', fontSize: 16, marginTop: 15, marginBottom: 20},
    reloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#e7f3ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007bff',
    },
    reloadButtonText: {
        color: '#007bff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeDashboard;
