import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { router } from 'expo-router';


const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"

const RegisterScreen = () => {
    const [name, setName] = useState("")
    const [role, setRole] = useState('student'); // 'student' or 'teacher'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        console.log(name)
        console.log(role)
        console.log(email)
        console.log(password)

        let signUp = async (name, email, password, role) => {
            // Perform sign-in logic here
            const endpoint = `${API_URL}/api/auth/register`;

            // 1. Create the request body object with the required parameters.
            const requestBody = {
                name,
                email,
                password,
                role
            };

            try {

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {

                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify(requestBody),
                });


                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(`Sign-in failed with status ${response.status}: ${errorData.message || response.statusText}`);
                }

                // 4. The response is a plain text token, so we use response.text().
                const { status, message } = await response.json();

                if (status === "200") {
                    Alert.alert("sucess", message, [
                        {
                            text: "Ok",
                            onPress: () => console.log("Later button pressed"),
                            style: "cancel"
                        },
                    ],
                        { cancelable: true })
                }

            } catch (error) {
                // 5. Catch any network errors or errors thrown from the response check.
                console.error('An error occurred during sign-in:', error);
                // Re-throw the error so the calling code can handle it if needed.
                throw error;
            }
        }

        signUp(name, email, password, role)

    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Register</Text>
                        <Text style={styles.subtitle}>Sign up for your account</Text>
                    </View>

                    {/* Role Selection */}
                    <View style={styles.radioSection}>
                        <Text style={styles.sectionTitle}>Select Role</Text>
                        <View style={styles.radioContainer}>
                            {/* Student Radio Button */}
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setRole('student')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.radioButton}>
                                    {role === 'student' && <View style={styles.radioButtonSelected} />}
                                </View>
                                <View style={styles.radioLabel}>
                                    <Text style={styles.radioLabelText}>👨‍🎓 Student</Text>
                                    <Text style={styles.radioLabelSubtext}>Mark attendance</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Teacher Radio Button */}
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setRole('teacher')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.radioButton}>
                                    {role === 'teacher' && <View style={styles.radioButtonSelected} />}
                                </View>
                                <View style={styles.radioLabel}>
                                    <Text style={styles.radioLabelText}>👩‍🏫 Teacher</Text>
                                    <Text style={styles.radioLabelSubtext}>Manage classes</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Name Input */}exporting appsmith apps
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={[
                                styles.input
                            ]}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={[
                                styles.input
                            ]}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={[
                                styles.input
                            ]}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                        ]}
                        onPress={handleSubmit}
                        // disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Have an account?{' '}
                        </Text>
                        <Pressable style={styles.footerLink} onPress={() => router.navigate("/sign-in")}>
                            <Text style={styles.footerText}>Sign in here </Text></Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
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
        textAlign: 'center',
    },
    radioSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radioOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3b82f6',
    },
    radioLabel: {
        flex: 1,
    },
    radioLabelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    radioLabelSubtext: {
        fontSize: 12,
        color: '#6b7280',
    },
    inputSection: {
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
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        minHeight: 54,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: '#6b7280',
    },
    footerLink: {
        color: '#3b82f6',
        fontWeight: '600',
    },
});

export default RegisterScreen;