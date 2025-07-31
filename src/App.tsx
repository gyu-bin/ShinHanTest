import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import { UserManagement, RoleManagement, ResourceManagement, GroupManagement, ProjectManagement, SessionManagement, HistoryManagement, SafetyFilterManagement, Home } from './pages';
import UserDetail from './pages/admin/userDetail/UserDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import CreateUser from "./pages/admin/userDetail/createUser";
import IDE from "./pages/home/ide";
import SafetyFilterDetail from "./pages/admin/userDetail/detail/SafetyFilterDetail";
import RoleDetailPage from "./pages/admin/userDetail/detail/RoleDetailPage";
import ProjectDetailPage from "./pages/admin/userDetail/detail/ProjectDetailPage";
import GroupDetailPage from "./pages/admin/userDetail/detail/GroupDetailPage";
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
              <Route path="/admin/user-management" element={<UserManagement />} />
              <Route path="/admin/role-management" element={<RoleManagement />} />
              <Route path="/admin/resource-management" element={<ResourceManagement />} />
              <Route path="/admin/group-management" element={<GroupManagement />} />
              <Route path="/admin/project-management" element={<ProjectManagement />} />
              <Route path="/admin/session-management" element={<SessionManagement />} />
              <Route path="/admin/history-management" element={<HistoryManagement />} />
              <Route path="/admin/safety-filter-management" element={<SafetyFilterManagement />} />
              <Route path="/admin/users/:id" element={<UserDetail />} />
              <Route path="/admin/users/create" element={<CreateUser />} />
              <Route path="/admin/safety-filters/:id" element={<SafetyFilterDetail />} />
              <Route path="/admin/roles/:roleId" element={<RoleDetailPage />} />
              <Route path="/admin/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/admin/groups/:groupId" element={<GroupDetailPage />} />
            </Routes>
          </Layout>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
