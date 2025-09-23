import { useSession } from '@/context/ctx'; // Your session hook
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, router } from 'expo-router';

export default function TabLayout() {
    const { session } = useSession();

    const sessionObj = JSON.parse(session)


    // If no session, don't render tabs (should redirect to auth)
    if (!session?.token || !session?.role) {
        router.replace("sign-in")
    }

    const isTeacher = sessionObj.role === 'teacher';
    const isStudent = sessionObj.role === 'student';

    console.log(isTeacher)
    console.log(isStudent)

    if (isTeacher) {
        return (
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                    tabBarStyle: {
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E5E7',
                        paddingBottom: 5,
                        paddingTop: 5,
                        height: 100,
                        marginBottom: 10
                    },
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="teacher-dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home-outline" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="teacher-classes"
                    options={{
                        title: 'Classes',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="school-outline" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'settings',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="settings-outline" size={24} color={color} />
                        ),
                    }}
                />

                {/* Hide student screens for teachers */}
                <Tabs.Screen
                    name="student-dashboard"
                    options={{
                        href: null, // This hides the screen from navigation
                    }}
                />
                <Tabs.Screen
                    name="student-classes"
                    options={{
                        href: null, // This hides the screen from navigation
                    }}
                />
            </Tabs>
        )
    }
    else {
        return (
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                    tabBarStyle: {
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E5E7',
                        paddingBottom: 5,
                        paddingTop: 5,
                        height: 100,
                        marginBottom: 10
                    },
                    headerShown: false,
                }}
            >

                <Tabs.Screen
                    name="student-dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="person-outline" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="student-classes"
                    options={{
                        title: 'Classes',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="book-outline" size={24} color={color} />
                        ),
                    }}
                />
                {/* Hide teacher screens for students */}
                <Tabs.Screen
                    name="teacher-dashboard"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="teacher-classes"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        )
    }
}