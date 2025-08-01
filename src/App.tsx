import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Latout";
import {
  UserManagement,
  RoleManagement,
  ResourceManagement,
  GroupManagement,
  ProjectManagement,
  SessionManagement,
  HistoryManagement,
  SafetyFilterManagement,
  Home,
} from "./pages";
import UserDetail from "./pages/admin/user/detail/UserDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import CreateUser from "./pages/admin/user/createUser";
import IDE from "./pages/home/ide";
import SafetyFilterDetail from "./pages/admin/safety/detail/SafetyFilterDetail";
import RoleDetailPage from "./pages/admin/role/detail/RoleDetailPage";
import ProjectDetailPage from "./pages/admin/project/detail/ProjectDetailPage";
import GroupDetailPage from "./pages/admin/group/detail/GroupDetailPage";
import ResourcePresetDetail from "./pages/admin/resource/detail/ResourcePresetDetail";
import ApproveManagement from "./pages/admin/approve/ApproveManagement";
import Register from "./pages/home/register";
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/home/ide" element={<IDE />} />
              <Route path="/home/register" element={<Register />} />
              <Route
                path="/admin/user-management"
                element={<UserManagement />}
              />
              <Route
                path="/admin/role-management"
                element={<RoleManagement />}
              />
              <Route
                path="/admin/approve-management"
                element={<ApproveManagement />}
              />
              <Route
                path="/admin/resource-management"
                element={<ResourceManagement />}
              />
              <Route
                path="/admin/group-management"
                element={<GroupManagement />}
              />
              <Route
                path="/admin/project-management"
                element={<ProjectManagement />}
              />
              <Route
                path="/admin/session-management"
                element={<SessionManagement />}
              />
              <Route
                path="/admin/history-management"
                element={<HistoryManagement />}
              />
              <Route
                path="/admin/safety-filter-management"
                element={<SafetyFilterManagement />}
              />
              <Route path="/admin/users/:id" element={<UserDetail />} />
              <Route path="/admin/users/create" element={<CreateUser />} />
              <Route
                path="/admin/safety-filters/:id"
                element={<SafetyFilterDetail />}
              />
              <Route path="/admin/roles/:roleId" element={<RoleDetailPage />} />
              <Route
                path="/admin/projects/:projectId"
                element={<ProjectDetailPage />}
              />
              <Route
                path="/admin/groups/:groupId"
                element={<GroupDetailPage />}
              />
              <Route
                path="/admin/resource/presets/:taskType"
                element={<ResourcePresetDetail />}
              />
            </Routes>
          </Layout>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
