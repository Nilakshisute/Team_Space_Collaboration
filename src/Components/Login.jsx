import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Heading,
  useToast,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = { uid: userId, ...userDoc.data() };
        setUserData(userData);
        navigate("/home");
      } else {
        throw new Error("User profile not found in Firestore.");
      }
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
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Box w="100%" maxW="md" bg="white" boxShadow="lg" p={8} borderRadius="lg">
        <VStack spacing={6} align="stretch">
          <Heading size="lg" textAlign="center" color="teal.600">
            Welcome Back
          </Heading>

          <form onSubmit={handleLogin}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                isDisabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : "Login"}
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm" color="gray.600">
            Don't have an account?{" "}
            <Link as={RouterLink} to="/register" color="teal.500">
              Register
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default LoginPage;
