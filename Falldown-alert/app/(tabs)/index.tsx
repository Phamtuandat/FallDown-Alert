import { Link } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { ref, onValue, set, push } from 'firebase/database';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/Authprovider';
import * as Notifications from 'expo-notifications';
import { Device, DeviceStatus } from '@/models/Device';
import { db, rtdb } from '@/services/Firebase';
import { AlertMessage } from '@/models/AlertMessage';

export default function HomeScreen() {
  const isInitialLoad = useRef(true);
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus[]>([]);

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



  // Fetch device status
  useEffect(() => {
    const statusRef = ref(rtdb, 'ESP32/Devices');
    let unsubscribe: () => void;

    const fetchAndListenDevices = async () => {
      const devicesCol = collection(db, 'devices');
      const deviceSnapshot = await getDocs(devicesCol);

      let firestoreDevices = deviceSnapshot.docs.map((doc) => ({
        device_id: doc.id,
        ...doc.data(),
      })) as Device[];

      if (firestoreDevices.length === 0) {
        const defaultDevice: Device = {
          name: 'Demo Device',
          createdAt: Date.now(),
          phone: '1234567890',
          email: 'test@example.com',
          owner: 'John Doe',
        };

        const docRef = await addDoc(devicesCol, defaultDevice);
        const defaultStatus: DeviceStatus = {
          lastSeen: Date.now(),
          location: 'Unknown',
          status: 'Active',
          name: defaultDevice.name,
          device_id: docRef.id,
        };

        firestoreDevices.push({
          device_id: docRef.id,
          ...defaultDevice,
        });
        await set(ref(rtdb, `ESP32/Devices/${docRef.id}`), defaultStatus);
      }

      unsubscribe = onValue(statusRef, (snapshot) => {
        const statusData = snapshot.val();
        const mergedStatuses: DeviceStatus[] = firestoreDevices.map((device) => {
          const statusEntry = statusData?.[device.device_id || ''] || {};
          const lastSeen = statusEntry.lastSeen;
          const isOffline = Date.now() - lastSeen > 5 * 60 * 1000;

          return {
            device_id: device.device_id,
            name: device.name,
            location: statusEntry.location || 'Unknown',
            lastSeen,
            status: isOffline ? 'Inactive' : 'Active',
          };
        });

        setDeviceStatus(mergedStatuses);
      });
    };

    fetchAndListenDevices();
    const interval = setInterval(() => {
      fetchAndListenDevices();
    }, 5 * 60 * 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, []);

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

  useEffect(() => {
    const messagesRef = ref(rtdb, 'alerts');

    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray: AlertMessage[] = [];

        Object.entries(data).forEach(([deviceKey, messages]: any) => {
          Object.entries(messages).forEach(([msgId, msgData]: any) => {
            messagesArray.push({
              device: deviceKey,
              id: msgId,
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
              title: '🚨 Fall Alert',
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

  const addNewDevice = () => {
    alert('Work in progress');
  };

  const renderDeviceStatus = () => {
    if (deviceStatus.length === 0) {
      return <Text>No devices added yet.</Text>;
    }

    return deviceStatus.map((device) => (
      <Link
        key={device.device_id}
        href={{
          pathname: '/device/[device_id]',
          params: { device_id: device.device_id || 'unknown' },
        }}
        asChild
      >
        <TouchableOpacity style={styles.deviceItem}>
          <Text style={styles.deviceText}>Device Name: {device.name}</Text>
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
