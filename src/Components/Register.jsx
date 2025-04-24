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
  Divider,
  HStack,
  Link,
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

    // Validate passwords
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate terms acceptance
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
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user data to Firestore
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          firstName,
          lastName,
          email,
          createdAt: new Date(),
        });
      } catch (firestoreError) {
        toast({
          title: "Error saving user data.",
          description: firestoreError.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        throw firestoreError; // Re-throw to handle it in the outer catch block
      }

      // Show success toast and navigate
      toast({
        title: "Account created.",
        description: "Welcome to TeamSpace!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/home");
    } catch (error) {
      // Handle errors during account creation
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
      <Box
        w="100%"
        maxW="md"
        bg="white"
        boxShadow="lg"
        p={8}
        borderRadius="lg"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" color="teal.600">Join TeamSpace</Heading>
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
                    size="md"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    size="md"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  size="md"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Password must be at least 6 characters
                </Text>
              </FormControl>

              <FormControl isRequired isInvalid={passwordError}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  size="md"
                />
                {passwordError && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {passwordError}
                  </Text>
                )}
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
                size="md"
                mt={2}
              >
                {isLoading ? <Spinner size="sm" /> : "Create Account"}
              </Button>
            </VStack>
          </form>
    
          <Text textAlign="center" fontSize="sm" color="gray.600" mt={4}>
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="teal.500" fontWeight="medium">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Register;