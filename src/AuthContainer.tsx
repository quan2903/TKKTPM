"use client";
import * as React from "react";
import { useLocation } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { ImageOverlay } from "./ImageOverlay";
import { Login } from ".views/Login";
import Register  from "./views/Register";

export const AuthContainer: React.FC = () => {
  const location = useLocation();

  return (
    <AuthLayout>
      <ImageOverlay />
      {location.pathname === "/register" ? <Register /> : <Login />}
    </AuthLayout>
  );
};
