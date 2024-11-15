"use client";
// write me a basic student page

import React from "react";
import StudentDashboard from "@/components/Dashboards/StudentDashboard";
import NormalPageWrapper from "@/wrappers/NormalPageWrapper";
import { ProtectedByAuth } from "@/contexts/AuthContext";

const StudentPage = () => {
  return (
    <NormalPageWrapper>
      <StudentDashboard />
    </NormalPageWrapper>
  );
};

export default ProtectedByAuth(StudentPage);
