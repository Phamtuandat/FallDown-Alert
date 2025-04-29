import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
} from 'react-native';
import { Menu, Divider, Provider } from 'react-native-paper';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/Firebase';

export default function DeviceDetail() {
    const { device_id } = useLocalSearchParams();
    const navigation = useNavigation();

    const [deviceName, setDeviceName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState('Active');
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    useEffect(() => {
        navigation.setOptions({
            title: `Device ${device_id}`,
            headerBackVisible: false,
        });

        const fetchDevice = async () => {
            if (!device_id) return;

            try {
                const docRef = doc(db, 'devices', String(device_id));
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setDeviceName(data.name || '');
                    setPhoneNumber(data.phone || '');
                    setStatus(data.status || 'Active');
                } else {
                    Alert.alert('Error', 'Device not found.');
                }
            } catch (error) {
                console.error('Error fetching device:', error);
                Alert.alert('Error', 'Failed to fetch device data.');
            }
        };

        fetchDevice();
    }, [device_id]);

    const handleSave = async () => {
        try {
            const docRef = doc(db, 'devices', String(device_id));
            await updateDoc(docRef, {
                name: deviceName,
                phone: phoneNumber,
                status,
            });

            Alert.alert('Saved', `Device ${device_id} updated successfully!`);
        } catch (error) {
            console.error('Error updating device:', error);
            Alert.alert('Error', 'Failed to update device.');
        }
    };

    return (
        <Provider>
            <View style={styles.container}>
                <Text style={styles.heading}>Device Detail</Text>
                <Text style={styles.text}>Device ID: {device_id}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Device Name"
                    value={deviceName}
                    onChangeText={setDeviceName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />
                <Text style={styles.label}>Status:</Text>
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={
                        <Text onPress={openMenu} style={styles.dropdown}>
                            {status}
                        </Text>
                    }
                >
                    <Menu.Item onPress={() => { setStatus('Active'); closeMenu(); }} title="Active" />
                    <Menu.Item onPress={() => { setStatus('Inactive'); closeMenu(); }} title="Inactive" />
                    <Divider />
                    <Menu.Item onPress={() => { setStatus('Disconnected'); closeMenu(); }} title="Disconnected" />
                </Menu>

                <Button title="Save Changes" onPress={handleSave} />
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 6,
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        marginTop: 12,
    },
    dropdown: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        fontSize: 16,
        backgroundColor: '#f5f5f5',
    },
});
