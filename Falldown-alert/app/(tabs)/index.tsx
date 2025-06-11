import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { collection, getDocs } from "firebase/firestore";
import { get, onValue, ref, update } from "firebase/database";

import { DeviceCard } from "@/components/DeviceCard";
import { ThemeContext } from "@/context/ThemeContext";
import { useAlertListener } from "@/hooks/useAlertListener";
import { Device, DeviceStatus } from "@/models/Device";
import { db, rtdb } from "@/services/Firebase";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const alertMessages = useAlertListener();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Link href="/notification/notifications" asChild>
          <TouchableOpacity
            style={{
              marginRight: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              backgroundColor: theme.colors.primary,
              borderRadius: 5,
              position: "relative",
            }}
          >
            <AntDesign name="bells" size={24} color={theme.colors.card} />
            {alertMessages.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  backgroundColor: theme.colors.notification,
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.card,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {alertMessages.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Link>
      ),
    });
  }, [navigation, alertMessages]);

  useEffect(() => {
    const statusRef = ref(rtdb, "ESP32/Devices");
    let unsubscribe: () => void;

    const fetchDevicesFromFirestore = async () => {
      const devicesCol = collection(db, "devices");
      const deviceSnapshot = await getDocs(devicesCol);
      return deviceSnapshot.docs.map((doc) => ({
        device_id: doc.id,
        ...doc.data(),
      })) as Device[];
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

        if (isOffline && statusEntry.status !== "Inactive") {
          const deviceStatusRef = ref(
            rtdb,
            `ESP32/Devices/${device.device_id}`
          );
          await update(deviceStatusRef, { status: "Inactive" });
        }

        mergedStatuses.push({
          device_id: device.device_id,
          name: device.name,
          location: statusEntry.location || "Unknown",
          lastSeen,
          status: newStatus,
          userStatus: {
            needHelp: statusEntry.userStatus?.needHelp || false,
            reason: statusEntry.userStatus?.reason || null,
            reportedAt: statusEntry.userStatus?.reportedAt || null,
          },
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

    setupRealtimeListener();
    const interval = setInterval(pollingCheck, 60_000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, []);

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

  const addNewDevice = () => {
    alert("Work in progress");
  };

  const themedStyles = styles(theme);

  return (
    <View style={themedStyles.container}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
        }}
      >
        {deviceStatus.length > 0 ? (
          deviceStatus.map((device) => (
            <DeviceCard key={device.device_id} device={device} />
          ))
        ) : (
          <Text>No devices added yet.</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={themedStyles.floatingButton}
        onPress={addNewDevice}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    floatingButton: {
      position: "absolute",
      bottom: 30,
      right: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.colors.text,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
  });
