import { View, Text, TextInput, Button, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/Authprovider';

const Login = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const { login } = useAuth(); // Use authentication context

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        console.log('Login screen mounted');
        navigation.setOptions({ headerShown: false });
    }, [navigation]); // ✅ Add dependency array to avoid re-execution

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const success = await login(email, password); // Authenticate user
        if (success) {
            router.replace('/(tabs)'); // Redirect on success
            Alert.alert('Success', 'Logged in successfully!');
        } else {
            Alert.alert('Error', 'Invalid email or password.');
        }
    };

    return (
        <View style={{ paddingHorizontal: 40, marginTop: 220, marginBottom: "auto" }}>
            <Text style={{ fontSize: 40, textAlign: 'center', fontWeight: 'bold', marginBottom: 60 }}>Login</Text>

            <View style={{ marginBottom: 15 }}>
                <Text style={{ marginBottom: 5 }}>Email</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                    }}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={{ marginBottom: 15 }}>
                <Text style={{ marginBottom: 5 }}>Password</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                    }}
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <Button title="Login" onPress={handleLogin} />

            <Text style={{ textAlign: 'center', marginTop: 15 }}>
                Don't have an account?{' '}
                <Text
                    style={{ color: 'blue' }}
                    onPress={() => router.replace('./signin')}
                >
                    Sign up
                </Text>
            </Text>
        </View>
    );
};

export default Login;
