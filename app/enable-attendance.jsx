import { useSession } from '@/context/ctx';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"

const EnableAttendanceScreen = () => {
    const { class_id } = useLocalSearchParams();
    const { session } = useSession();
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [isPolling, setIsPolling] = useState(false);

    // New state for attendance features
    const [qrCodeEnabled, setQrCodeEnabled] = useState(false);
    const [facialVerificationEnabled, setFacialVerificationEnabled] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);

    // Generate a random secret for QR code (you might want to get this from your API)
    const generateSecret = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const [qrSecret] = useState(generateSecret());

    let sessionObj = JSON.parse(session)

    console.log(`enable-attendance:role is`, sessionObj.role)
    console.log("qrCode status:", qrCodeEnabled)

    useEffect(() => {
        fetchRecentAttendance();

        // Set up polling every 30 seconds
        const interval = setInterval(() => {
            fetchRecentAttendance();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchRecentAttendance = async () => {
        try {
            setIsPolling(true);
            const response = await fetch(`${API_URL}/api/attend/recent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionObj.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    class_code: class_id
                }),
            });

            const data = await response.json();
            console.log(data)
            if (data.names) {
                setRecentAttendance(data.names);
            }
        } catch (error) {
            console.error('Failed to fetch recent attendance:', error);
        } finally {
            setIsPolling(false);
        }
    };

    const handleEnableAttendance = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/attend/enable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionObj.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    class_code: class_id,
                    is_qr_enabled: qrCodeEnabled ? '1' : '0'
                }),
            });

            const data = await response.json();
            setApiResponse(JSON.stringify(data, null, 2));
            setShowModal(true);
        } catch (error) {
            setApiResponse(`Enable failed: ${error.message}`);
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisableAttendance = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/attend/disable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionObj.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    class_code: class_id,
                    is_qr_enabled: qrCodeEnabled
                }),
            });

            const data = await response.json();
            setApiResponse(JSON.stringify(data, null, 2));
            setShowModal(true);
        } catch (error) {
            setApiResponse(`Disable failed: ${error.message}`);
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setApiResponse('');
    };

    const closeQRModal = () => {
        setShowQRModal(false);
    };

    const handleQRCodeToggle = () => {
        const newQrCodeEnabled = !qrCodeEnabled;
        setQrCodeEnabled(newQrCodeEnabled);

        if (newQrCodeEnabled) {
            setShowQRModal(true);
        }
    };

    const handleFacialVerificationToggle = () => {
        setFacialVerificationEnabled(!facialVerificationEnabled);
    };

    const qrUrl = `${API_URL}/qr/verify/${class_id}?secret=${qrSecret}`;

    const CheckboxItem = ({ label, checked, onToggle, icon }) => (
        <Pressable style={styles.checkboxItem} onPress={onToggle}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Feather name="check" size={14} color="#fff" />}
            </View>
            <Feather name={icon} size={18} color="#666" style={styles.checkboxIcon} />
            <Text style={styles.checkboxLabel}>{label}</Text>
        </Pressable>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Permissions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Permissions</Text>
                    <View style={styles.buttonGroup}>
                        <Pressable
                            style={[styles.enableButton, isLoading && styles.disabledButton]}
                            onPress={handleEnableAttendance}
                            disabled={isLoading}
                        >
                            <Feather name="play" size={20} color="#fff" />
                            <Text style={styles.enableButtonText}>
                                {isLoading ? 'Loading...' : 'Enable Attendance'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.disableButton, isLoading && styles.disabledButton]}
                            onPress={handleDisableAttendance}
                            disabled={isLoading}
                        >
                            <Feather name="pause" size={20} color="#fff" />
                            <Text style={styles.disableButtonText}>
                                {isLoading ? 'Loading...' : 'Disable Attendance'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Attendance Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attendance Features</Text>
                    <View style={styles.featuresContainer}>
                        <CheckboxItem
                            label="QR Code"
                            checked={qrCodeEnabled}
                            onToggle={handleQRCodeToggle}
                            icon="qr-code"
                        />
                        <CheckboxItem
                            label="Facial Verification"
                            checked={facialVerificationEnabled}
                            onToggle={handleFacialVerificationToggle}
                            icon="user-check"
                        />
                    </View>
                </View>

                {/* Recent Attendance Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Attendance</Text>
                        {isPolling && (
                            <ActivityIndicator size="small" color="#007AFF" />
                        )}
                    </View>

                    <View style={styles.attendanceContainer}>
                        {recentAttendance.length > 0 ? (
                            recentAttendance.map((name, index) => (
                                <View key={index} style={styles.attendanceItem}>
                                    <Feather name="user" size={16} color="#666" />
                                    <Text style={styles.attendanceName}>{name}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Feather name="users" size={32} color="#ccc" />
                                <Text style={styles.emptyText}>No recent attendance</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* API Response Modal */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>API Response</Text>
                        <ScrollView style={styles.modalTextContainer}>
                            <Text style={styles.modalText}>{apiResponse}</Text>
                        </ScrollView>
                        <Pressable style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                visible={showQRModal}
                transparent={true}
                animationType="slide"
                onRequestClose={closeQRModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.qrModalContent}>
                        <View style={styles.qrModalHeader}>
                            <Text style={styles.qrModalTitle}>QR Code for Attendance</Text>
                            <Pressable onPress={closeQRModal}>
                                <Feather name="x" size={24} color="#666" />
                            </Pressable>
                        </View>

                        <View style={styles.qrCodeContainer}>
                            <QRCode
                                value={qrUrl}
                                size={250}
                                color="#000"
                                backgroundColor="#fff"
                            />
                        </View>

                        <Text style={styles.qrUrlText}>
                            Students can scan this QR code to mark their attendance
                        </Text>

                        <View style={styles.qrModalButtons}>
                            <Pressable style={styles.qrModalButton} onPress={closeQRModal}>
                                <Text style={styles.qrModalButtonText}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    buttonGroup: {
        gap: 12,
    },
    enableButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 8,
        justifyContent: 'center',
    },
    enableButtonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
    },
    disableButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc3545',
        padding: 16,
        borderRadius: 8,
        justifyContent: 'center',
    },
    disableButtonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
    // New styles for attendance features
    featuresContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 16,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    checkboxIcon: {
        marginRight: 8,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    attendanceContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 200,
        padding: 16,
    },
    attendanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    attendanceName: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '90%',
        maxWidth: 400,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalTextContainer: {
        maxHeight: 200,
        marginBottom: 20,
    },
    modalText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    modalButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // QR Modal styles
    qrModalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        width: '90%',
        maxWidth: 350,
        alignItems: 'center',
    },
    qrModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    qrModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    qrCodeContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
    },
    qrUrlText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    qrModalButtons: {
        width: '100%',
    },
    qrModalButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    qrModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EnableAttendanceScreen;