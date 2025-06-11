import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/Authprovider";
import { ThemeContext } from "@/context/ThemeContext";

const Login = () => {
  const { theme } = useContext(ThemeContext)!;
  const navigation = useNavigation();
  const router = useRouter();
  const { login } = useAuth(); // Use authentication context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    console.log("Login screen mounted");
    navigation.setOptions({ headerShown: false });
  }, [navigation]); // ✅ Add dependency array to avoid re-execution

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const success = await login(email, password); // Authenticate user
    if (success) {
      router.replace("/(tabs)"); // Redirect on success
      Alert.alert("Success", "Logged in successfully!");
    } else {
      Alert.alert("Error", "Invalid email or password.");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>

      <View style={styles.inputContainer}>
        <Text style={{ color: theme.colors.text, marginBottom: 5 }}>Email</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.border}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={{ color: theme.colors.text, marginBottom: 5 }}>
          Password
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          placeholder="Enter your password"
          placeholderTextColor={theme.colors.border}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Button
        title="Login"
        onPress={handleLogin}
        color={theme.colors.primary}
      />

      <Text style={[styles.footerText, { color: theme.colors.text }]}>
        Don't have an account?{" "}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => router.replace("./signin")}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    marginTop: 220,
    marginBottom: "auto",
    flex: 1,
  },
  title: {
    fontSize: 40,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 60,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  footerText: {
    textAlign: "center",
    marginTop: 15,
  },
});
export default Login;
