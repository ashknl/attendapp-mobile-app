import { useSession } from '@/context/ctx';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SettingsPage() {
    const { session, signOut } = useSession();

    let sessionObj = JSON.parse(session)

    console.log(`role is`, sessionObj.role)

    const handleSignOut = () => {
        signOut()
    };

    const handleUploadFace = () => {
        router.navigate("upload-face")
    };

    if (sessionObj.role === 'teacher') {
        return (
            <View style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <Pressable style={styles.button} onPress={handleSignOut}>
                        <Feather name="log-out" size={20} color="#666" />
                        <Text style={styles.buttonText}>Sign out</Text>
                    </Pressable>
                </View>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <Pressable style={styles.button} onPress={handleSignOut}>
                        <Feather name="log-out" size={20} color="#666" />
                        <Text style={styles.buttonText}>Sign out</Text>
                    </Pressable>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>For Students</Text>
                    <Pressable style={styles.button} onPress={handleUploadFace}>
                        <Feather name="camera" size={20} color="#666" />
                        <Text style={styles.buttonText}>Upload Face</Text>
                    </Pressable>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
})