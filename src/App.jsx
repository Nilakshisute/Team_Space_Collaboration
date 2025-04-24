import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Box } from "@chakra-ui/react";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Home from "./components/Home"; //
import ForgotPassword from "./components/ForgotPassword";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
