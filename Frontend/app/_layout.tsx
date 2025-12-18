// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { AuthProvider } from "../src/auth/AuthProvider";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </Provider>
  );
}
