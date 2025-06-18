import { Theme } from "@react-navigation/native";
import { createContext } from "react";

export const ThemeContext = createContext<{
  theme: Theme & {
    colors: Theme["colors"] & {
      secondary: string;
      danger: string;
      success: string;
    };
  };
}>({
  theme: {
    dark: false,
    colors: {
      // Primary UI elements (buttons, links)
      primary: "#0056b3", // deep blue (more contrast than light blue)

      // Background & surface
      background: "#ffffff", // stays white for clean readability
      card: "#f1f1f1", // slightly darker gray for better contrast with white

      // Text
      text: "#111111", // almost black for better readability

      // Borders
      border: "#999999", // medium gray for clearer separation

      // Alerts or Notifications
      notification: "#0d6efd", // vibrant blue (vs. cyan)
      danger: "#b00020", // deeper red for contrast
      success: "#2e7d32", // dark green for better visibility
      secondary: "#495057", // darker secondary gray
    },

    fonts: {
      regular: { fontFamily: "System", fontWeight: "normal" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "bold" },
      heavy: { fontFamily: "System", fontWeight: "900" },
    },
  },
});
