import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Users } from "../pages/Users";
import { UserDetails } from "../pages/UserDetails";
import { VideoRequests } from "../pages/VideoRequests";
import { VideoRequestDetails } from "../pages/VideoRequestDetails";
import { AuditLogs } from "../pages/AuditLogs";
import { Unauthorized } from "../pages/Unauthorized";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MODERATOR", "SUPERADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/video-requests" element={<VideoRequests />} />
          <Route path="/video-requests/:id" element={<VideoRequestDetails />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
