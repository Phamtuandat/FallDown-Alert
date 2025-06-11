import { View, Text, TextInput, Button } from "react-native";
import React, { useContext, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { ThemeContext } from "@/context/ThemeContext";

export default function Signin() {
  const { theme } = useContext(ThemeContext)!;
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <View
      style={{
        paddingHorizontal: 40,
        marginTop: 220,
        marginBottom: "auto",
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: 40,
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 60,
          color: theme.colors.text,
        }}
      >
        Sign In
      </Text>

      <View
        style={{
          marginBottom: 15,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ width: "48%" }}>
          <TextInput
            style={{
              height: 40,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: theme.colors.text,
            }}
            placeholder="First name"
            placeholderTextColor={theme.colors.border}
          />
        </View>

        <View style={{ width: "48%" }}>
          <TextInput
            style={{
              height: 40,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: theme.colors.text,
            }}
            placeholder="Last name"
            placeholderTextColor={theme.colors.border}
          />
        </View>
      </View>

      <View style={{ marginBottom: 15 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            color: theme.colors.text,
          }}
          placeholder="Email"
          placeholderTextColor={theme.colors.border}
          keyboardType="email-address"
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            color: theme.colors.text,
          }}
          placeholder="Password"
          placeholderTextColor={theme.colors.border}
          secureTextEntry
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            color: theme.colors.text,
          }}
          placeholder="Repeat Password"
          placeholderTextColor={theme.colors.border}
          secureTextEntry
        />
      </View>

      <Button
        title="Sign In"
        onPress={() => console.log("Sign In pressed")}
        color={theme.colors.primary}
      />

      <Text
        style={{ textAlign: "center", marginTop: 15, color: theme.colors.text }}
      >
        Already have an account?{" "}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => router.replace("./login")}
        >
          Login
        </Text>
      </Text>
    </View>
  );
}
