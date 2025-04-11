import { Link } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useLayoutEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { useAuth } from '@/context/Authprovider';
import * as Notifications from 'expo-notifications';
import { Device } from '@/models/Device';

const firebaseConfig = {
  apiKey: "AIzaSyBwoVtmXhoe0X1H43yDXRBJ-4oGT-qrtdI",
  authDomain: "emergency-4aecc.firebaseapp.com",
  databaseURL: "https://emergency-4aecc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "emergency-4aecc",
  storageBucket: "emergency-4aecc.firebasestorage.app",
  messagingSenderId: "300222582072",
  appId: "1:300222582072:web:c50a128ca1cdf31db745cd",
  measurementId: "G-SLEM3KQSCX"
};

const app = initializeApp(firebaseConfig);

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [activeDeviceList, setActiveDeviceList] = useState<Device[]>([]);
  const [alertMessages, setAlertMessages] = useState<{ id: string; text: string; timestamp: number }[]>([]);

  // Header logout button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.LogoutBtn}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  useEffect(() => {
    const sendMessageToRTDB = async (message: string) => {
      const db = getDatabase();
      const messagesRef = ref(db, 'alerts/device1');

      const newMessage = {
        text: message,
        timestamp: Date.now(),
      };

      await push(messagesRef, newMessage);
    };

    // Push message after 2 seconds (optional delay)
    const timer = setTimeout(() => {
      sendMessageToRTDB("device is raising a falldown alert!");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const db = getDatabase(app);
    const deviceStatusRef = ref(db, 'ESP32/Devices');

    const unsubscribe = onValue(deviceStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const devicesArray = Object.keys(data).map((key) => ({
          device_id: key,
          ...data[key],
        }));
        setActiveDeviceList(devicesArray);
      } else {
        setActiveDeviceList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Notification setup
  useEffect(() => {
    (async () => {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
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
      if (status !== 'granted') {
        alert('Permission not granted for notifications!');
      }
    })();
  }, []);

  const addNewDevice = () => {

  };
  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, 'alerts/device1');

    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));

        messagesArray.sort((a, b) => b.timestamp - a.timestamp);
        setAlertMessages(messagesArray);

        // ✅ Show notification for the most recent message
        const latestMessage = messagesArray[0];
        if (latestMessage) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🚨 Fall Alert',
              body: latestMessage.text,
              sound: true,
            },
            trigger: null, // immediate
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);
  const renderDeviceStatus = () => {
    if (activeDeviceList.length === 0) {
      return <Text>No devices added yet.</Text>;
    }

    return activeDeviceList.map((device) => (
      <Link
        key={device.device_id}
        href={{
          pathname: '/device/[device_id]',
          params: { device_id: device.device_id },
        }}
        asChild
      >
        <TouchableOpacity style={styles.deviceItem}>
          <Text style={styles.deviceText}>Device ID: {device.device_id}</Text>
          <Text
            style={[
              styles.deviceText,
              device.status === 'Active' ? styles.statusActive : styles.statusInactive,
            ]}
          >
            Status: {device.status || 'Unknown'}
          </Text>
        </TouchableOpacity>
      </Link>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={{ width: '100%' }}>
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
    alignItems: 'center',
    padding: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  LogoutBtn: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceItem: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  statusActive: {
    color: 'green',
  },
  statusInactive: {
    color: 'red',
  },
});
