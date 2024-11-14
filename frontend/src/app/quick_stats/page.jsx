"use client";
// write me a basic student page

import React from "react";
import TeamQuickStats from "@/components/Dashboards/TeamQuickStats";
import NormalPageWrapper from "@/wrappers/NormalPageWrapper";
import { ProtectedByAuth } from "@/contexts/AuthContext";
import { Container } from "@mui/material";

const StudentPage = () => {
  return (
    <NormalPageWrapper>
      <Container>
        <TeamQuickStats />
      </Container>
    </NormalPageWrapper>
  );
};

export default ProtectedByAuth(StudentPage);
