import {
  View,
  Text,
  Linking,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { AlertMessage } from "@/models/AlertMessage";
import { onValue, push, ref, update } from "firebase/database";
import { rtdb } from "@/services/Firebase";

export default function notifications() {
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);
  useEffect(() => {
    const messagesRef = ref(rtdb, "alerts");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray: AlertMessage[] = mapToAlertMessages(data);
        console.log(messagesArray);
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
    <View style={{ padding: 20, backgroundColor: "#f9f9f9", flex: 1 }}>
      <ScrollView>
        {alertMessages.map((message) => (
          <View
            key={message.createdAt}
            style={{
              marginBottom: 15,
              padding: 15,
              backgroundColor: message.read ? "#e0e0e0" : "#fff",
              borderRadius: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              opacity: message.read ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 5,
                color: message.read ? "gray" : "black",
              }}
            >
              {message.name}
              {message.read && (
                <Text style={{ fontSize: 12, color: "green" }}> (Read)</Text>
              )}
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 5 }}>
              {message.message}
            </Text>
            <Text style={{ fontSize: 12, color: "gray", marginBottom: 10 }}>
              {new Date(message.createdAt).toLocaleString()}
            </Text>
            {message.location && (
              <Text
                style={{
                  color: "#007BFF",
                  textDecorationLine: "underline",
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
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Make All As Read" onPress={readAll} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  message: { fontSize: 18, marginVertical: 8 },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});
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
