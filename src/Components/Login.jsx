import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4}>
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        maxW="md"
        w="full"
      >
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading size="lg" color="teal.600">Welcome to TeamSpace</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Sign in to your collaborative workspace
            </Text>
          </Box>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <VStack spacing={5}>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  size="md"
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  size="md"
                />
              </FormControl>

              <Flex justify="space-between" align="center" width="full">
                <Checkbox colorScheme="teal">
                  <Text fontSize="sm">Remember me</Text>
                </Checkbox>
                <Link as={RouterLink} to="/forgot-password" color="teal.500" fontSize="sm">
                  Forgot password?
                </Link>
              </Flex>

              <Button
                colorScheme="teal"
                type="submit" 
                isLoading={isLoading}
                loadingText="Signing in"
                width="full"
                size="md"
                mt={2}
              >
                Sign in
              </Button>
            </VStack>
          </form>

          <Divider />
          
          <Text textAlign="center" fontSize="sm" color="gray.600">
            Don't have an account?{" "}
            <Link as={RouterLink} to="/register" color="teal.500" fontWeight="medium">
              Create one
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Login;