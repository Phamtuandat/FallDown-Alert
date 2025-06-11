import { useEffect, useRef, useState } from "react";
import { AlertMessage } from "@/models/AlertMessage";
import { ref, onValue } from "firebase/database";
import * as Notifications from "expo-notifications";
import { rtdb } from "@/services/Firebase";

export const useAlertListener = () => {
  const isInitialLoad = useRef(true);
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);

  useEffect(() => {
    const messagesRef = ref(rtdb, "alerts");

    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray: AlertMessage[] = [];
        Object.entries(data).forEach(([deviceKey, messages]: any) => {
          Object.entries(messages).forEach(([msgId, msgData]: any) => {
            messagesArray.push({
              device: deviceKey,
              id: msgId,
              createdAt: new Date(msgData.createdAt).getTime(),
              ...msgData,
            });
          });
        });

        const messageList = messagesArray
          .filter((msg) => !msg.read)
          .sort((a, b) => b.createdAt - a.createdAt);

        setAlertMessages(messageList);

        // Trigger local notification if new alerts after initial load
        if (!isInitialLoad.current && messageList.length > 0) {
          for (const msg of messageList) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "🚨 Fall Alert",
                body: msg.message,
                sound: true,
              },
              trigger: null,
            });
          }
        }

        isInitialLoad.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  return alertMessages;
};
