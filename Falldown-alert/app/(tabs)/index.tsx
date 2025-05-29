import { Link } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { ref, onValue, set, push, update, get } from "firebase/database";
import { addDoc, collection, getDocs } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { Device, DeviceStatus } from "@/models/Device";
import { db, rtdb } from "@/services/Firebase";
import { AlertMessage } from "@/models/AlertMessage";

export default function HomeScreen() {
  const isInitialLoad = useRef(true);
  const navigation = useNavigation();
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Link href="/notification/notifications" asChild>
          <TouchableOpacity style={styles.logoutButton}>
            <AntDesign name="bells" size={24} color="white" />
            {alertMessages.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  backgroundColor: "red",
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                >
                  {alertMessages.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Link>
      ),
    });
  }, [navigation]);

  // Fetch device status
  useEffect(() => {
    const statusRef = ref(rtdb, "ESP32/Devices");
    let unsubscribe: () => void;

    const fetchDevicesFromFirestore = async () => {
      const devicesCol = collection(db, "devices");
      const deviceSnapshot = await getDocs(devicesCol);
      const deviceList: Device[] = deviceSnapshot.docs.map((doc) => ({
        device_id: doc.id,
        ...doc.data(),
      })) as Device[];
      console.log(deviceList);
      return deviceList;
    };

    const processDeviceStatuses = async (
      statusData: any,
      firestoreDevices: Device[]
    ) => {
      const mergedStatuses: DeviceStatus[] = [];

      for (const device of firestoreDevices) {
        const statusEntry = statusData?.[device.device_id || ""] || {};
        const lastSeen = statusEntry.lastSeen;
        const isOffline =
          Date.now() - new Date(lastSeen).getTime() > 5 * 60 * 1000;
        const newStatus = isOffline ? "Inactive" : "Active";

        const deviceStatusRef = ref(rtdb, `ESP32/Devices/${device.device_id}`);
        if (isOffline && statusEntry.status !== "Inactive") {
          await update(deviceStatusRef, {
            status: "Inactive",
          });
          console.log(
            `Updated status for device ${device.device_id} to Inactive`
          );
        }

        mergedStatuses.push({
          device_id: device.device_id,
          name: device.name,
          location: statusEntry.location || "Unknown",
          lastSeen,
          status: newStatus,
        });
      }

      setDeviceStatus(mergedStatuses);
    };

    const setupRealtimeListener = async () => {
      const firestoreDevices = await fetchDevicesFromFirestore();

      unsubscribe = onValue(statusRef, async (snapshot) => {
        const statusData = snapshot.val();
        await processDeviceStatuses(statusData, firestoreDevices);
      });
    };

    const pollingCheck = async () => {
      const firestoreDevices = await fetchDevicesFromFirestore();
      const snapshot = await get(statusRef);
      const statusData = snapshot.val();
      await processDeviceStatuses(statusData, firestoreDevices);
    };

    setupRealtimeListener(); // One-time setup

    const interval = setInterval(() => {
      pollingCheck();
    }, 1 * 60 * 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Request notification permissions and set up notification handler
  useEffect(() => {
    (async () => {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
      });

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission not granted for notifications!");
      }
    })();
  }, []);

  // Listen for new alert messages
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
        messagesArray.sort((a, b) => b.createdAt - a.createdAt);
        setAlertMessages(messagesArray);
        const latestMessage = messagesArray[0];
        if (!isInitialLoad.current && latestMessage) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🚨 Fall Alert",
              body: latestMessage.message,
              sound: true,
            },
            trigger: null,
          });
        }
        isInitialLoad.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to add a new device (placeholder)
  const addNewDevice = () => {
    alert("Work in progress");
  };

  const renderDeviceStatus = () => {
    if (deviceStatus.length === 0) {
      return <Text>No devices added yet.</Text>;
    }

    return deviceStatus.map((device) => (
      <Link
        key={device.device_id}
        href={{
          pathname: "/device/[device_id]",
          params: { device_id: device.device_id || "unknown" },
        }}
        asChild
      >
        <TouchableOpacity style={styles.deviceItem}>
          <Text style={styles.deviceText}>Device Name: {device.name}</Text>
          <Text
            style={[
              styles.deviceText,
              device.status === "Active"
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            Status: {device.status || "Unknown"}
          </Text>
          <Text style={styles.deviceText}>
            Location: {device.location || "Unknown"}
          </Text>
          {device.location && (
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                device.location
              )}`}
              asChild
            >
              <TouchableOpacity>
                <Text
                  style={[
                    styles.deviceText,
                    { color: "blue", textDecorationLine: "underline" },
                  ]}
                >
                  View on Map
                </Text>
              </TouchableOpacity>
            </Link>
          )}
        </TouchableOpacity>
      </Link>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {renderDeviceStatus()}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.floatingButton} onPress={addNewDevice}>
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "red",
    borderRadius: 5,
  },
  Notification: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deviceItem: {
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  statusActive: {
    color: "green",
  },
  statusInactive: {
    color: "red",
  },
});
