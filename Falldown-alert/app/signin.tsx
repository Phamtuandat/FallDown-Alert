import { View, Text, TextInput, Button } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation, useRouter } from 'expo-router';

export default function signin() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        console.log('Sign In screen mounted');
        navigation.setOptions({
            headerShown: false,
        })
    })
    return (
        <View style={{ paddingHorizontal: 40, marginTop: 220, marginBottom: "auto" }}>
            <Text style={{ fontSize: 40, textAlign: 'center', fontWeight: 'bold', marginBottom: 60 }}>Sign In</Text>
            <View style={{ marginBottom: 15, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ marginBottom: 5, width: '48%' }}>
                    <TextInput
                        style={{
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            width: '100%'
                        }}
                        placeholder="Enter your first name"
                    />
                </View>
                <View style={{ marginBottom: 5, width: '48%' }}>
                    <TextInput
                        style={{
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            width: '100%'
                        }}
                        placeholder="Enter your last name"
                    />
                </View>

            </View>
            <View style={{ marginBottom: 15 }}>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                    }}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                />
            </View>
            <View style={{ marginBottom: 15 }}>
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
                />
            </View>
            <View style={{ marginBottom: 15 }}>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                    }}
                    placeholder="Enter your password again"
                    secureTextEntry
                />
            </View>

            <Button title="Sign In" onPress={() => console.log('Sign In pressed')} />
            <Text style={{ textAlign: 'center', marginTop: 15 }}>
                Already have an account?{' '}
                <Text
                    style={{ color: 'blue' }}
                    onPress={() => router.replace('./login')}
                >
                    Login
                </Text>
            </Text>
        </View>
    )
}