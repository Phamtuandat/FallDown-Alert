import { View, Text, Linking } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { AlertMessage } from '@/models/AlertMessage';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '@/services/Firebase';
import * as Notifications from 'expo-notifications';

export default function notifications() {
    const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);
    const isInitialLoad = useRef(true);
    useEffect(() => {
        const messagesRef = ref(rtdb, 'alerts'); // Reference to your alerts node in Firebase

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messagesArray: AlertMessage[] = [];

                // Iterate over data and format it into messages
                Object.entries(data).forEach(([deviceKey, messages]) => {
                    Object.entries(messages as Record<string, any>).forEach(([msgId, msgData]) => {
                        messagesArray.push({
                            device: deviceKey,
                            id: msgId, // This is the message ID
                            ...msgData,
                        });
                    });
                });

                // Sort messages by createdAt, assuming createdAt is a timestamp
                messagesArray.sort((a, b) => b.createdAt - a.createdAt);
                setAlertMessages(messagesArray);
            }
        });

        // Clean up the listener when the component is unmounted
        return () => unsubscribe();

    }, []); // Empty dependency array ensures this only runs once after component mounts

    return (
        <View style={{ padding: 20, backgroundColor: '#f9f9f9', flex: 1 }}>
            {alertMessages.map((message) => (
                <View
                    key={message.id}
                    style={{
                        marginBottom: 15,
                        padding: 15,
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                        elevation: 3,
                    }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
                        {message.name}
                    </Text>
                    <Text style={{ fontSize: 14, marginBottom: 5 }}>{message.message}</Text>
                    <Text style={{ fontSize: 12, color: 'gray', marginBottom: 10 }}>
                        {new Date(message.createdAt).toLocaleString()}
                    </Text>
                    {message.location && (
                        <Text
                            style={{
                                color: '#007BFF',
                                textDecorationLine: 'underline',
                                fontSize: 14,
                            }}
                            onPress={() => {
                                Linking.openURL(message.location as string);
                            }}
                        >
                            View Location
                        </Text>
                    )}
                </View>
            ))}
        </View>
    )
}