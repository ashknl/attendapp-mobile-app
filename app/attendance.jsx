import { useSession } from '@/context/ctx';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';


const VerifyFaceScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isCheckingAttendance, setIsCheckingAttendance] = useState(true);
    const [attendanceEnabled, setAttendanceEnabled] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [similarity, setSimilarity] = useState(null);
    const cameraRef = useRef(null);

    const { class_id } = useLocalSearchParams()

    const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"

    const { session } = useSession();
    let sessionObj = JSON.parse(session)
    console.log(`in attendance:role is`, sessionObj.role)
    console.log(`in attendance:token is`, sessionObj.token)
    console.log(class_id)

    useEffect(() => {
        checkAttendanceStatus();
    }, []);

    const checkAttendanceStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/attend/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionObj.token}`,
                },
                body: JSON.stringify({
                    "class_code": class_id
                })
            });

            const data = await response.json();
            console.log(data)
            setAttendanceEnabled(data.enable === "1");
        } catch (error) {
            Alert.alert('Error', 'Failed to check attendance status');
        } finally {
            setIsCheckingAttendance(false);
        }
    };

    const handleOpenCamera = async () => {
        if (!permission) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert('Permission required', 'Camera permission is needed to take photos');
                return;
            }
        }
        setShowCamera(true);
    };

    const handleTakePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                setCapturedImage(photo.uri);
                setShowCamera(false);
            } catch (error) {
                Alert.alert('Error', 'Failed to take picture');
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setVerificationResult(null);
        setSimilarity(null);
        setShowCamera(true);
    };

    const handleUpload = async () => {
        if (!capturedImage) {
            Alert.alert('Error', 'No image selected');
            return;
        }

        setIsUploading(true);
        setVerificationResult(null);
        setSimilarity(null);

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: capturedImage,
                type: 'image/jpeg',
                name: 'verification_image.jpg',
            });

            const response = await fetch(`${API_URL}/api/face/verify`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${sessionObj.token}`,
                },

            });

            const data = await response.json();
            setApiResponse(JSON.stringify(data, null, 2));

            if (data.similarity !== undefined) {
                setSimilarity(data.similarity);
                setVerificationResult(data.similarity >= 0.90 ? 'success' : 'failed');
            }

            setShowModal(true);
        } catch (error) {
            setApiResponse(`Verification failed: ${error.message}`);
            setShowModal(true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleMarkAttend = async () => {
        // TODO: Implement mark attendance logic
        try {
            console.log(class_id)
            const response = await fetch(`${API_URL}/api/class/attend`, {
                method: 'POST',
                body: JSON.stringify({
                    "class_code": class_id
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionObj.token}`,
                },

            });

            

            const data = await response.json();
            setApiResponse(JSON.stringify(data.message));
            setShowModal(true);
        } catch (error) {
            setApiResponse(`Marking attendance failed failed: ${error.message}`);
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setApiResponse('');
    };

    if (showCamera) {
        return (
            <View style={styles.container}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="front"
                >
                    <View style={styles.cameraControls}>
                        <Pressable style={styles.controlButton} onPress={() => setShowCamera(false)}>
                            <Feather name="x" size={24} color="#fff" />
                        </Pressable>
                        <Pressable style={styles.captureButton} onPress={handleTakePicture}>
                            <View style={styles.captureButtonInner} />
                        </Pressable>
                    </View>
                </CameraView>
            </View>
        );
    }

    if (isCheckingAttendance) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Checking attendance status...</Text>
                </View>
            </View>
        );
    }

    if (!attendanceEnabled) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Feather name="clock" size={64} color="#999" />
                    <Text style={styles.disabledText}>Attendance has not been enabled</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Verify Face</Text>

                {capturedImage ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: capturedImage }} style={styles.previewImage} />

                        {similarity !== null && verificationResult === 'failed' && (
                            <Text style={styles.failureText}>
                                Uploaded face not similar to previously uploaded face. Verification failed
                            </Text>
                        )}

                        {similarity !== null && verificationResult === 'success' && (
                            <Text style={styles.successText}>
                                Face verified successfully! Similarity: {(similarity * 100).toFixed(1)}%
                            </Text>
                        )}

                        <View style={styles.buttonGroup}>
                            <Pressable style={styles.secondaryButton} onPress={handleRetake}>
                                <Feather name="camera" size={20} color="#666" />
                                <Text style={styles.secondaryButtonText}>Retake</Text>
                            </Pressable>

                            {verificationResult !== 'success' && (
                                <Pressable
                                    style={[styles.primaryButton, isUploading && styles.disabledButton]}
                                    onPress={handleUpload}
                                    disabled={isUploading}
                                >
                                    <Feather name="upload" size={20} color="#fff" />
                                    <Text style={styles.primaryButtonText}>
                                        {isUploading ? 'Verifying...' : 'Verify'}
                                    </Text>
                                </Pressable>
                            )}

                            {verificationResult === 'success' && (
                                <Pressable style={styles.attendButton} onPress={handleMarkAttend}>
                                    <Feather name="check" size={20} color="#fff" />
                                    <Text style={styles.attendButtonText}>Mark Attendance</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ) : (
                    <Pressable style={styles.verifyButton} onPress={handleOpenCamera}>
                        <Feather name="camera" size={32} color="#666" />
                        <Text style={styles.verifyButtonText}>Verify Face</Text>
                    </Pressable>
                )}
            </View>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verification Response</Text>
                        <Text style={styles.modalText}>{apiResponse}</Text>
                        <Pressable style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    disabledText: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    camera: {
        flex: 1,
    },
    cameraControls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    imageContainer: {
        alignItems: 'center',
        width: '100%',
    },
    previewImage: {
        width: 300,
        height: 300,
        borderRadius: 150,
        marginBottom: 20,
    },
    successText: {
        fontSize: 16,
        color: '#28a745',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    failureText: {
        fontSize: 16,
        color: '#dc3545',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 15,
    },
    verifyButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: '80%',
    },
    verifyButtonText: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    secondaryButtonText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    attendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    attendButtonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
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
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
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
});

export default VerifyFaceScreen;