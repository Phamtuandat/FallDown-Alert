import {
  View,
  Text,
  Linking,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { AlertMessage } from "@/models/AlertMessage";
import { onValue, ref, update } from "firebase/database";
import { rtdb } from "@/services/Firebase";
import { ThemeContext } from "@/context/ThemeContext"; // your custom ThemeContext

export default function Notifications() {
  const { theme } = useContext(ThemeContext); // use your ThemeContext here
  const styles = getThemedStyles(theme);

  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);

  useEffect(() => {
    const messagesRef = ref(rtdb, "alerts");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray: AlertMessage[] = mapToAlertMessages(data);
        messagesArray.sort((a, b) => b.createdAt - a.createdAt);
        setAlertMessages(messagesArray);
      }
    });
    return () => unsubscribe();
  }, []);

  const readAll = () => {
    alertMessages.forEach((msg) => {
      const msgRef = ref(rtdb, `alerts/pr1GoGBZ3EH2KjIonoDm/${msg.id}`);
      update(msgRef, { ...msg, read: true });
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {alertMessages.map((message) => (
          <View
            key={message.createdAt}
            style={[
              styles.messageContainer,
              { opacity: message.read ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.messageTitle}>
              {message.name}
              {message.read && (
                <Text style={{ fontSize: 12, color: "green" }}> (Read)</Text>
              )}
            </Text>
            <Text style={styles.messageText}>{message.message}</Text>
            <Text style={styles.messageDate}>
              {new Date(message.createdAt).toLocaleString()}
            </Text>
            {message.location && (
              <Text
                style={styles.locationLink}
                onPress={() => Linking.openURL(message.location as string)}
              >
                View Location
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Make All As Read" onPress={readAll} />
      </View>
    </View>
  );
}

function getThemedStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    messageContainer: {
      marginBottom: 15,
      padding: 15,
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      shadowColor: theme.dark ? "#000" : "#ccc",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    messageTitle: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 5,
      color: theme.colors.text,
    },
    messageText: {
      fontSize: 14,
      marginBottom: 5,
      color: theme.colors.text,
    },
    messageDate: {
      fontSize: 12,
      color: theme.colors.notification,
      marginBottom: 10,
    },
    locationLink: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
      fontSize: 14,
    },
    buttonContainer: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
    },
  });
}

function mapToAlertMessages(input: any): AlertMessage[] {
  return Object.values(input).flatMap((messages) =>
    Object.entries(messages as Record<string, any>).map(([id, msg]) => ({
      id,
      message: msg.message,
      location: msg.location ?? null,
      name: msg.name ?? null,
      createdAt: new Date(msg.createdAt).getTime(),
      read: msg.read ?? false,
    }))
  );
}
