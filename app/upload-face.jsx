
// import { useLocalSearchParams } from 'expo-router';
// import { StyleSheet, Text, View } from 'react-native';

// export default function SettingScreen() {
//     // const { session } = useSession();
//     // const { class_id } = useLocalSearchParams()
//     // console.log('Search Params:', class_id)

//     // let sessionObj = JSON.parse(session)
//     // console.log(`in demo:role is`, sessionObj.role)
//     // console.log(`in demo:token is`, sessionObj.token)

//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>Upload image</Text>
//         </View>
//     );
// }
import { useSession } from '@/context/ctx';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const UploadFaceScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const cameraRef = useRef(null);

    const { session } = useSession();
    let sessionObj = JSON.parse(session)
    console.log(`in demo:role is`, sessionObj.role)
    console.log(`in demo:token is`, sessionObj.token)

    const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"

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
        setShowCamera(true);
    };

    const handleUpload = async () => {
        if (!capturedImage) {
            Alert.alert('Error', 'No image selected');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: capturedImage,
                type: 'image/jpeg',
                name: 'face_image.jpg',
            });

            const response = await fetch(`${API_URL}/api/face/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${sessionObj.token}`,
                },
            });

            const responseObj = await response.json();
            setApiResponse(responseObj.message);
            setShowModal(true);

            if (response.ok) {
                setCapturedImage(null);
            }
        } catch (error) {
            setApiResponse(`Upload failed: ${error.message}`);
            setShowModal(true);
        } finally {
            setIsUploading(false);
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

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Upload Face Image</Text>

                {capturedImage ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                        <View style={styles.buttonGroup}>
                            <Pressable style={styles.secondaryButton} onPress={handleRetake}>
                                <Feather name="camera" size={20} color="#666" />
                                <Text style={styles.secondaryButtonText}>Retake</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.primaryButton, isUploading && styles.disabledButton]}
                                onPress={handleUpload}
                                disabled={isUploading}
                            >
                                <Feather name="upload" size={20} color="#fff" />
                                <Text style={styles.primaryButtonText}>
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <Pressable style={styles.uploadButton} onPress={handleOpenCamera}>
                        <Feather name="camera" size={32} color="#666" />
                        <Text style={styles.uploadButtonText}>Take Face Photo</Text>
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
                        <Text style={styles.modalTitle}>Upload Response</Text>
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
        marginBottom: 30,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 15,
    },
    uploadButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: '80%',
    },
    uploadButtonText: {
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
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
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

export default UploadFaceScreen;