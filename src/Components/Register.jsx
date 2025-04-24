import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Heading,
  useToast,
  Spinner,
  Select,
  HStack,
  Link,
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!isTermsAccepted) {
      toast({
        title: "Terms not accepted.",
        description: "You must agree to the Terms and Privacy Policy.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      await setDoc(doc(db, "users", userId), {
        firstName,
        lastName,
        email,
        role,
        joinedWorkspaces: [],
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Account created.",
        description: "Welcome to TeamSpace!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/home");
    } catch (error) {
      toast({
        title: "Error creating account.",
        description: error.message,
        status: "error",
        duration: 3000,
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
          <Box textAlign="center">
            <Heading size="lg" color="teal.600">
              Join TeamSpace
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Create your account to start collaborating
            </Text>
          </Box>

          <form onSubmit={handleRegister}>
            <VStack spacing={5}>
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>
              </HStack>

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
                  minLength={6}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Password must be at least 6 characters
                </Text>
              </FormControl>

              <FormControl isRequired isInvalid={passwordError}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {passwordError && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {passwordError}
                  </Text>
                )}
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  placeholder="Select your role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin (create workspaces)</option>
                  <option value="member">Member (join workspaces)</option>
                </Select>
              </FormControl>

              <FormControl>
                <Checkbox
                  colorScheme="teal"
                  isChecked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                >
                  <Text fontSize="sm">
                    I agree to the{" "}
                    <Link color="teal.500" href="/terms">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link color="teal.500" href="/privacy">
                      Privacy Policy
                    </Link>
                  </Text>
                </Checkbox>
              </FormControl>

              <Button
                colorScheme="teal"
                type="submit"
                width="full"
                isDisabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : "Create Account"}
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm" color="gray.600" mt={4}>
            Already have an account?{" "}
            <Link
              as={RouterLink}
              to="/login"
              color="teal.500"
              fontWeight="medium"
            >
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default RegisterPage;
