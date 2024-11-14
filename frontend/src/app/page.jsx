"use client";

import React from "react";
import { ProtectedByAuth } from "../contexts/AuthContext";

// Dashboards
import GeneralDashboard from "../components/Dashboards/GeneralDashboard";
import NormalPageWrapper from "@/wrappers/NormalPageWrapper";

function App() {
  return (
    <NormalPageWrapper>
      <GeneralDashboard />
    </NormalPageWrapper>
  );
}

export default ProtectedByAuth(App);
