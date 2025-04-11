import { Stack } from 'expo-router';

export default function DeviceLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[device_id]"
                options={{
                    title: 'Device Detail', // ← custom title here
                    headerTitleAlign: 'center', // optional
                }}
            />
        </Stack>
    );
}
