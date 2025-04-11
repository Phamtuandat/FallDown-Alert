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
    }, [device_id]);

    const handleSave = () => {
        Alert.alert('Saved', `Device ${device_id} updated:\nName: ${deviceName}\nPhone: ${phoneNumber}\nStatus: ${status}`);
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
