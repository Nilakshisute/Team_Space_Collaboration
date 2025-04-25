// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Home from "../src/Components/Home";
import CreateWorkspace from "./Components/CreateWorkspace";
import WorkspaceDashboard from "./Components/WorkspaceDashboard";
import DocumentEditor from "./Components/workspace/DocumentEditor";
import NotFound from "./Components/NotFound";

const ProtectedRoute = ({ children }) => {
  const { userData } = useAuth();
  return userData ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { userData } = useAuth();
  return userData?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/home" replace />
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:id"
              element={
                <ProtectedRoute>
                  <WorkspaceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/document/:documentId"
              element={
                <ProtectedRoute>
                  <DocumentEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-workspace"
              element={
                <AdminRoute>
                  <CreateWorkspace />
                </AdminRoute>
              }
            />

            {/* Redirects and Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
