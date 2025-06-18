import { db, rtdb } from "@/services/Firebase";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ref, update, onValue } from "firebase/database";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Provider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function DeviceDetail() {
  const { device_id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [deviceName, setDeviceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Live from RTDB
  const [status, setStatus] = useState("Unknown");
  const [needHelp, setNeedHelp] = useState(false);
  const [reason, setReason] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  useEffect(() => {
    navigation.setOptions({
      title: { deviceName },
      headerTitleAlign: "center", // optional, for visual symmetry
    });
  }, [navigation]);
  useEffect(() => {
    if (!device_id) return;

    navigation.setOptions({
      title: deviceName || "Device Details",
    });

    // Get metadata from Firestore
    const fetchDeviceFromFirestore = async () => {
      try {
        const docRef = doc(db, "devices", String(device_id));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDeviceName(data.name || "");
          setPhoneNumber(data.phone || "");
        } else {
          Alert.alert("Error", "Device not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching device:", error);
        Alert.alert("Error", "Failed to fetch Firestore data.");
      }
    };

    // Subscribe to RTDB live updates
    const subscribeToRealtimeStatus = () => {
      const deviceRef = ref(rtdb, `ESP32/Devices/${device_id}`);
      const unsubscribe = onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStatus(data.status || "Unknown");
          setNeedHelp(data.userStatus?.needHelp ?? false);
          setReason(data.userStatus?.reason ?? "");
          setReportedAt(data.userStatus?.reportedAt ?? "");
        }
      });
      return unsubscribe;
    };

    fetchDeviceFromFirestore();
    const unsubscribe = subscribeToRealtimeStatus();

    return () => unsubscribe();
  }, [device_id]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "devices", String(device_id));
      await updateDoc(docRef, {
        name: deviceName,
        phone: phoneNumber,
      });

      Alert.alert("Saved", `Device ${device_id} updated successfully!`);
    } catch (error) {
      console.error("Error updating device:", error);
      Alert.alert("Error", "Failed to update device.");
    }
  };

  const markUserAsWell = async () => {
    try {
      const now = new Date().toISOString();
      const deviceRef = ref(rtdb, `ESP32/Devices/${device_id}`);
      await update(deviceRef, {
        status: "Active",
        userStatus: {
          needHelp: false,
          reason: "is well",
          reportedAt: now,
        },
      });
      Alert.alert("User Status", "User is well now!");
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const triggerSOS = async () => {
    try {
      const now = new Date().toISOString();
      const deviceRef = ref(rtdb, `ESP32/Devices/${device_id}`);
      await update(deviceRef, {
        status: "Inactive",
        userStatus: {
          needHelp: true,
          reason: "Manually triggered SOS",
          reportedAt: now,
        },
      });
      Alert.alert("SOS Triggered", "User marked as needing help.");
    } catch (error) {
      console.error("Error triggering SOS:", error);
    }
  };

  const handlePhonePress = () => {
    if (!phoneNumber) {
      Alert.alert(
        "Missing Number",
        "This device has no phone number assigned."
      );
      return;
    }

    Alert.alert("Call Device Owner", `Do you want to call ${phoneNumber}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL(`tel:${phoneNumber}`) },
    ]);
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Phone call */}
        <TouchableOpacity
          style={[styles.callButton, { opacity: phoneNumber ? 1 : 0.6 }]}
          onPress={handlePhonePress}
          disabled={!phoneNumber}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="call-outline" size={20} color="#007bff" />
            <Text
              style={{
                fontSize: 16,
                color: phoneNumber ? "#007bff" : "#888",
                marginLeft: 8,
              }}
            >
              {phoneNumber || "No phone number assigned"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Status */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Device Status:</Text>
          <Text
            style={[
              styles.statusText,
              { color: status === "Active" ? "#28a745" : "#dc3545" },
            ]}
          >
            {status}
          </Text>
        </View>

        {/* Health Status */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>User Health Status:</Text>
          <View style={styles.statusBox}>
            {needHelp ? (
              <>
                <Text style={styles.dangerText}>🚨 Needs Attention!</Text>
                <Text style={styles.reason}>Reason: {reason || "-"}</Text>
                <Text style={styles.reason}>
                  Reported At:{" "}
                  {reportedAt ? new Date(reportedAt).toLocaleString() : "-"}
                </Text>
              </>
            ) : (
              <Text style={styles.successText}>✅ User is well</Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={{ marginTop: 20 }}>
          <Button title="Save Changes" onPress={handleSave} />
        </View>

        {needHelp ? (
          <View style={{ marginTop: 10 }}>
            <Button
              title="Mark as Well"
              color="green"
              onPress={markUserAsWell}
            />
          </View>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Button title="Trigger SOS" color="#dc3545" onPress={triggerSOS} />
          </View>
        )}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  callButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },
  statusBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  dangerText: {
    color: "#dc3545",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  successText: {
    color: "#28a745",
    fontWeight: "bold",
    fontSize: 16,
  },
  reason: {
    fontSize: 14,
    color: "#212529",
    marginTop: 2,
  },
});
