import { useSession } from '@/context/ctx';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TeacherDashboard() {
    const { session } = useSession();

    let sessionObj = JSON.parse(session)

    const [className, setClassName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!className.trim()) {
            setError('Class name is required');
            return false;
        }
        if (className.trim().length < 3) {
            setError('Class name must be at least 3 characters');
            return false;
        }
        setError('');
        return true;
    };

    const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"

    const handleCreateClass = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/class/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionObj.token}`, // Authorization header
                },
                body: JSON.stringify({
                    "class_name": className.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                Alert.alert(
                    'Success',
                    `Class "${className}" created successfully!`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setClassName(''); // Clear the input
                                // You could navigate to classes tab or refresh data here
                            },
                        },
                    ]
                );
            } else {
                // API error
                throw new Error(data.error || data.message || 'Failed to create class');
            }
        } catch (error) {
            console.error('Create class error:', error);

            // Handle different types of errors
            let errorMessage = 'Failed to create class. Please try again.';

            if (error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        if (error) setError('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Teacher Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back, Teacher!</Text>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>5</Text>
                            <Text style={styles.statLabel}>Total Classes</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>127</Text>
                            <Text style={styles.statLabel}>Total Students</Text>
                        </View>
                    </View>

                    {/* Create Class Section */}
                    <View style={styles.createClassSection}>
                        <Text style={styles.sectionTitle}>Create New Class</Text>
                        <Text style={styles.sectionSubtitle}>
                            Add a new class to start taking attendance
                        </Text>

                        {/* Class Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Class Name</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    error && styles.inputError
                                ]}
                                placeholder="Enter class name (e.g., Mathematics 101)"
                                value={className}
                                onChangeText={(text) => {
                                    setClassName(text);
                                    clearError();
                                }}
                                editable={!isLoading}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                            {error && (
                                <Text style={styles.errorText}>{error}</Text>
                            )}
                        </View>

                        {/* Create Class Button */}
                        <TouchableOpacity
                            style={[
                                styles.createButton,
                                isLoading && styles.createButtonDisabled
                            ]}
                            onPress={handleCreateClass}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text style={styles.createButtonText}>Creating...</Text>
                                </View>
                            ) : (
                                <Text style={styles.createButtonText}>Create Class</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Recent Activity Section */}
                    <View style={styles.activitySection}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <View style={styles.activityCard}>
                            <Text style={styles.activityText}>
                                📚 Mathematics 101 - 25 students present today
                            </Text>
                            <Text style={styles.activityTime}>2 hours ago</Text>
                        </View>
                        <View style={styles.activityCard}>
                            <Text style={styles.activityText}>
                                🔬 Physics 201 - Attendance taken for yesterday
                            </Text>
                            <Text style={styles.activityTime}>1 day ago</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
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
        marginBottom: 8,
    },
    tokenInfo: {
        fontSize: 12,
        color: '#9ca3af',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    createClassSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#ffffff',
        color: '#1f2937',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        marginTop: 4,
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 54,
    },
    createButtonDisabled: {
        opacity: 0.7,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 8,
    },
    activitySection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityCard: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    activityText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
});