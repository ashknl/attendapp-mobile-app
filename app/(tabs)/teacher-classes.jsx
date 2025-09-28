import { useSession } from '@/context/ctx';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { router } from 'expo-router';

export default function TeacherClasses() {
    const { session } = useSession();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedClass, setExpandedClass] = useState(null);
    const [error, setError] = useState('');

    const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"



    useEffect(() => {
        fetchClasses();
    }, []);

    let sessionObj = JSON.parse(session)

    console.log(`role is`, sessionObj.role)
    console.log(sessionObj.role !== "student")
    if (sessionObj.role !== "teacher") {
        return (
            <View style={styles.content}>
                <Text style={styles.title}>Invalid credentials</Text>
            </View>
        )
    }

    const fetchClasses = async (showRefreshIndicator = false) => {
        try {
            if (!showRefreshIndicator) {
                setIsLoading(true);
            }
            setError('');

            const response = await fetch(`${API_URL}/api/class/classes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionObj.token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setClasses(data.classes || []);
                console.log('Fetched classes:', data.classes);
            } else {
                throw new Error(data.error || data.message || 'Failed to fetch classes');
            }
        } catch (error) {
            console.error('Fetch classes error:', error);
            setError(error.message || 'Failed to load classes');
            Alert.alert('Error', 'Failed to load classes. Please try again.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchClasses(true);
    };

    const toggleClassDropdown = (classId) => {
        // setExpandedClass(expandedClass === classId ? null : classId);

        router.navigate({
            pathname: "enable-attendance",
            params: {
                "class_id": classId
            }
        })
    };

    const handleMarkAttendance = async (classItem) => {
        try {
            // Close dropdown
            setExpandedClass(null);

            Alert.alert(
                'Mark Attendance',
                `Start marking attendance for "${classItem.class_name}"?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Start',
                        onPress: () => {
                            console.log('Starting attendance marking for:', classItem);
                            // Here you would typically:
                            // 1. Navigate to attendance marking screen
                            // 2. Or open attendance marking modal
                            // 3. Or make API call to start attendance session

                            Alert.alert('Success', `Attendance marking started for "${classItem.class_name}"`);
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Mark attendance error:', error);
            Alert.alert('Error', 'Failed to start attendance marking');
        }
    };

    const handleStopMarkingAttendance = async (classItem) => {
        try {
            // Close dropdown
            setExpandedClass(null);

            Alert.alert(
                'Stop Marking Attendance',
                `Stop marking attendance for "${classItem.class_name}"?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Stop',
                        style: 'destructive',
                        onPress: () => {
                            console.log('Stopping attendance marking for:', classItem);
                            // Here you would typically:
                            // 1. Make API call to stop attendance session
                            // 2. Update UI to reflect stopped state

                            Alert.alert('Success', `Attendance marking stopped for "${classItem.class_name}"`);
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Stop marking attendance error:', error);
            Alert.alert('Error', 'Failed to stop attendance marking');
        }
    };

    const renderClassCard = (classItem) => {
        const isExpanded = expandedClass === classItem.class_id;

        return (
            <View key={classItem.class_id} style={styles.classCardContainer}>
                {/* Main Class Card */}
                <TouchableOpacity
                    style={[
                        styles.classCard,
                        isExpanded && styles.classCardExpanded
                    ]}
                    onPress={() => toggleClassDropdown(classItem.class_id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.classInfo}>
                        <Text style={styles.className}>{classItem.class_name}</Text>
                        <Text style={styles.classId}>ID: {classItem.class_id}</Text>
                    </View>

                    <View style={styles.chevronContainer}>
                        <Text style={[
                            styles.chevron,
                            isExpanded && styles.chevronExpanded
                        ]}>
                            ▼
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isExpanded && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity
                            style={[styles.dropdownItem, styles.markAttendanceItem]}
                            onPress={() => handleMarkAttendance(classItem)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.dropdownItemIcon}>✓</Text>
                            <Text style={[styles.dropdownItemText, styles.markAttendanceText]}>
                                Mark Attendance
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dropdownDivider} />

                        <TouchableOpacity
                            style={[styles.dropdownItem, styles.stopAttendanceItem]}
                            onPress={() => handleStopMarkingAttendance(classItem)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.dropdownItemIcon}>✕</Text>
                            <Text style={[styles.dropdownItemText, styles.stopAttendanceText]}>
                                Stop Marking Attendance
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading classes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#007AFF"
                        colors={['#007AFF']}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>My Classes</Text>
                    <Text style={styles.subtitle}>
                        {classes.length} {classes.length === 1 ? 'class' : 'classes'} found
                    </Text>
                </View>

                {/* Error State */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => fetchClasses()}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Classes List */}
                {classes.length > 0 ? (
                    <View style={styles.classesContainer}>
                        {classes.map((classItem) => renderClassCard(classItem))}
                    </View>
                ) : (
                    !error && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📚</Text>
                            <Text style={styles.emptyTitle}>No Classes Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Create your first class to get started with attendance tracking
                            </Text>
                        </View>
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        marginBottom: 24,
        marginTop:24
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    errorText: {
        fontSize: 14,
        color: '#dc2626',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    classesContainer: {
        gap: 12,
    },
    classCardContainer: {
        marginBottom: 4,
    },
    classCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    classCardExpanded: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    classInfo: {
        flex: 1,
    },
    className: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    classId: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'monospace',
    },
    chevronContainer: {
        padding: 8,
    },
    chevron: {
        fontSize: 12,
        color: '#9ca3af',
        transform: [{ rotate: '0deg' }],
    },
    chevronExpanded: {
        transform: [{ rotate: '180deg' }],
    },
    dropdown: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    dropdownItemIcon: {
        fontSize: 16,
        marginRight: 12,
        width: 20,
        textAlign: 'center',
    },
    dropdownItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    markAttendanceItem: {
        backgroundColor: '#f0f9ff',
    },
    markAttendanceText: {
        color: '#0369a1',
    },
    stopAttendanceItem: {
        backgroundColor: '#fef2f2',
    },
    stopAttendanceText: {
        color: '#dc2626',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
});