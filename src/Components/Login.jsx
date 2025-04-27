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
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  FormErrorMessage,
  Container,
  useColorModeValue,
  Badge,
  Link,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  const bgGradient = "linear(to-br, teal.400, blue.500)";
  const cardBg = useColorModeValue("white", "gray.800");
  const textColorPrimary = useColorModeValue("gray.800", "white");
  const textColorSecondary = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;
      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {
        setUserData({ uid: userId, ...userDoc.data() });

        toast({
          title: "Login successful",
          description: "Welcome to TeamSpace!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        navigate("/home");
      } else {
        throw new Error("User profile not found. Please contact support.");
      }
    } catch (error) {
      let errorMessage = "Failed to login. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
        setPasswordError("Incorrect password");
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed login attempts. Please try again later.";
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={4}>
      <Container maxW="md" py={{ base: 6, md: 10 }}>
        <Flex direction="column" alignItems="center" mb={4}>
          {/* Logo */}
          <Box
            bg="white"
            color="teal.500"
            p={2}
            rounded="full"
            mb={4}
            shadow="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="50px"
            h="50px"
          >
            <Text fontSize="xl" fontWeight="bold">
              TS
            </Text>
          </Box>

          <Heading size="lg" color="white" mb={1}>
            Welcome Back
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.900" mb={4}>
            Sign in to continue to your workspace
          </Text>
        </Flex>

        <Box
          bg={cardBg}
          p={5}
          rounded="xl"
          shadow="xl"
          borderWidth="1px"
          borderColor={borderColor}
          position="relative"
        >
          {/* <Badge 
            position="absolute"
            top="3"
            right="3"
            colorScheme="teal"
            variant="subtle"
            px="2"
            rounded="md"
            fontSize="xs"
          >
            Beta
          </Badge> */}

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <HStack spacing={1} align="center" justify="center" mb={1}>
                <FaLock color="teal" size="12px" />
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={textColorPrimary}
                >
                  Secure Login
                </Text>
              </HStack>

              <FormControl isRequired isInvalid={emailError !== ""}>
                <FormLabel fontSize="sm" mb={1}>
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="you@example.com"
                  size="md"
                  borderRadius="md"
                />
                {emailError && (
                  <FormErrorMessage fontSize="xs">
                    {emailError}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={passwordError !== ""}>
                <Flex justify="space-between" align="center" mb={1}>
                  <FormLabel fontSize="sm" mb={0}>
                    Password
                  </FormLabel>
                  <Link
                    fontSize="xs"
                    color="teal.500"
                    onClick={() => navigate("/forgot-password")}
                    _hover={{ color: "teal.600" }}
                    fontWeight="medium"
                  >
                    Forgot?
                  </Link>
                </Flex>
                <InputGroup size="md">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="••••••••"
                    borderRadius="md"
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "teal.500" }}
                    />
                  </InputRightElement>
                </InputGroup>
                {passwordError && (
                  <FormErrorMessage fontSize="xs">
                    {passwordError}
                  </FormErrorMessage>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                isLoading={isLoading}
                loadingText="Signing in"
                size="md"
                mt={1}
                bgGradient="linear(to-r, teal.400, teal.500)"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, teal.600)",
                }}
              >
                Sign In
              </Button>
            </VStack>
          </form>

          {/* <Flex align="center" my={3}>
            <Divider flex="1" borderColor={borderColor} />
            <Text
              px={2}
              color={textColorSecondary}
              fontSize="xs"
              fontWeight="medium"
            >
              OR
            </Text>
            <Divider flex="1" borderColor={borderColor} />
          </Flex> */}

          {/* <HStack spacing={3}>
            <Button
              flex="1"
              leftIcon={<FaGoogle />}
              variant="outline"
              size="sm"
              borderRadius="md"
              borderColor={borderColor}
              _hover={{
                bg: useColorModeValue("gray.50", "gray.700"),
              }}
              color={textColorPrimary}
            >
              Google
            </Button>
            <Button
              flex="1"
              leftIcon={<FaGithub />}
              variant="outline"
              size="sm"
              borderRadius="md"
              borderColor={borderColor}
              _hover={{
                bg: useColorModeValue("gray.50", "gray.700"),
              }}
              color={textColorPrimary}
            >
              GitHub
            </Button>
          </HStack> */}

          <Text
            textAlign="center"
            fontSize="sm"
            color={textColorSecondary}
            mt={4}
          >
            New to TeamSpace?{" "}
            <Link
              as={RouterLink}
              to="/register"
              color="teal.500"
              fontWeight="medium"
              _hover={{ color: "teal.600" }}
            >
              Create account
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
