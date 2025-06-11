import React, { useEffect, useContext } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  View,
} from "react-native";
import { Link } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { DeviceStatus } from "@/models/Device";
import { ThemeContext } from "@/context/ThemeContext";

type Props = {
  device: DeviceStatus;
};

export const DeviceCard = ({ device }: Props) => {
  const { theme } = useContext(ThemeContext);
  const screenWidth = Dimensions.get("window").width;

  const bgOpacity = useSharedValue(1);
  const bgColor = useSharedValue(theme.colors.card);

  useEffect(() => {
    if (device.userStatus?.needHelp) {
      bgColor.value = "#ffcccc";
      bgOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(bgOpacity);
      bgOpacity.value = withTiming(1, { duration: 400 });
      bgColor.value = withTiming(theme.colors.card, { duration: 400 });
    }
  }, [device.userStatus?.needHelp, theme.colors.card]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: bgColor.value,
    opacity: bgOpacity.value,
  }));

  const styles = StyleSheet.create({
    card: {
      alignSelf: "center",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#ccc",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 2,
      elevation: 4,
      width: screenWidth - 40,
      backgroundColor: theme.colors.card,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    mapLink: {
      color:
        device.location != "Unknown"
          ? theme.colors.primary
          : theme.colors.danger,
      textDecorationLine: "underline",
      marginTop: 6,
    },
    label: {
      fontWeight: "bold",
      marginTop: 6,
      color: theme.colors.text,
    },
    value: {
      color: theme.colors.text,
    },
  });

  const handleOpenMap = () => {
    const location = device.location;
    if (location && location !== "Unknown") {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        location
      )}`;
      Linking.openURL(url);
    }
  };

  return (
    <Link href={`/device/${device.device_id}`} asChild>
      <TouchableOpacity activeOpacity={0.9}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: theme.colors.text,
            }}
          >
            Device Name: {device.name}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color:
                device.status === "Active"
                  ? "green"
                  : theme.colors.notification,
            }}
          >
            Status: {device.status || "Unknown"}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: theme.colors.text,
            }}
          >
            Location: {device.location || "Unknown"}
          </Text>

          {/* 👇 View on Map Button */}
          {(device.location && device.location !== "Unknown" && (
            <Text onPress={handleOpenMap} style={styles.mapLink}>
              View on Map
            </Text>
          )) || (
            // if the location is not available, we don't show the map link
            <Text style={styles.mapLink}>Location not available</Text>
          )}

          {/* 👇 UserStatus Fields */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>
              User health status:{" "}
              <Text style={styles.value}>
                {device.userStatus?.reason || "-"}
              </Text>
              {device.userStatus?.needHelp && (
                <Text style={{ color: "red", fontWeight: "bold" }}>
                  {"  "}🚨 Needs Attention!
                </Text>
              )}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );
};
