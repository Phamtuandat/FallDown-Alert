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
      primary: "#007bff",
      background: "#ffffff",
      card: "#f8f9fa",
      text: "#212529",
      border: "#dee2e6",
      notification: "#17a2b8",

      // ✅ Custom colors
      secondary: "#6c757d", // grayish
      danger: "#dc3545", // red for errors
      success: "#28a745", // green for success
    },
    fonts: {
      regular: { fontFamily: "System", fontWeight: "normal" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "bold" },
      heavy: { fontFamily: "System", fontWeight: "900" },
    },
  },
});
