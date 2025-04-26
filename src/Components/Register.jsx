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
  Select,
  HStack,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  FormErrorMessage,
  Container,
  useColorModeValue,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub, FaUserPlus, FaArrowLeft } from "react-icons/fa";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const RegisterPage = () => {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Error state
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState(""); 
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [termsError, setTermsError] = useState("");
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgGradient = "linear(to-br, teal.400, blue.500)";
  const cardBg = useColorModeValue("white", "gray.800");
  const textColorPrimary = useColorModeValue("gray.800", "white");
  const textColorSecondary = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const validateCurrentTab = () => {
    let isValid = true;
    
    if (tabIndex === 0) {
      // Reset errors for first tab
      setFirstNameError("");
      setLastNameError("");
      setEmailError("");
      
      // Validate first name
      if (!firstName.trim()) {
        setFirstNameError("Required");
        isValid = false;
      }
      
      // Validate last name
      if (!lastName.trim()) {
        setLastNameError("Required");
        isValid = false;
      }
      
      // Validate email
      if (!email) {
        setEmailError("Required");
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        setEmailError("Invalid email");
        isValid = false;
      }
    } else if (tabIndex === 1) {
      // Reset errors for second tab
      setPasswordError("");
      setConfirmPasswordError("");
      setRoleError("");
      setTermsError("");
      
      // Validate password
      if (!password) {
        setPasswordError("Required");
        isValid = false;
      } else if (password.length < 6) {
        setPasswordError("Min 6 characters");
        isValid = false;
      }
      
      // Validate confirm password
      if (!confirmPassword) {
        setConfirmPasswordError("Required");
        isValid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords don't match");
        isValid = false;
      }
      
      // Validate role
      if (!role) {
        setRoleError("Select a role");
        isValid = false;
      }
      
      // Validate terms
      if (!isTermsAccepted) {
        setTermsError("Required");
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleNextTab = () => {
    if (validateCurrentTab()) {
      setTabIndex(1);
    }
  };

  const handlePreviousTab = () => {
    setTabIndex(0);
  };

  const handleTabChange = (index) => {
    // Only validate when going forward
    if (index > tabIndex) {
      if (validateCurrentTab()) {
        setTabIndex(index);
      }
    } else {
      // Allow going backward without validation
      setTabIndex(index);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset all errors
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setRoleError("");
    setTermsError("");
    
    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      isValid = false;
    }
    
    // Validate last name
    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      isValid = false;
    }
    
    // Validate email
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
    
    // Validate role
    if (!role) {
      setRoleError("Please select a role");
      isValid = false;
    }
    
    // Validate terms
    if (!isTermsAccepted) {
      setTermsError("You must agree to the Terms and Privacy Policy");
      isValid = false;
    }
    
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // If there are first tab errors, move back to first tab
      if (firstNameError || lastNameError || emailError) {
        setTabIndex(0);
      }
      return;
    }

    setIsLoading(true);

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
        title: "Account created!",
        description: "Welcome to TeamSpace!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      navigate("/home");
    } catch (error) {
      let errorMessage = "Error creating account. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use";
        setEmailError("Email is already in use");
        setTabIndex(0); // Move back to email tab if email is the issue
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
        setEmailError("Invalid email address");
        setTabIndex(0);
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
        setPasswordError("Password is too weak");
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      position="relative"
      overflow="hidden"
      py={{ base: 4, md: 8 }}
    >
      {/* Background patterns */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        opacity="0.1" 
        zIndex="0"
        bgImage="radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)"
        bgSize="100px 100px"
      />
      
      <Container maxW="md" position="relative" zIndex="1">
        <Flex direction="column" alignItems="center" mb={2}>
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
            <Text fontSize="xl" fontWeight="bold">TS</Text>
          </Box>
          
          <Heading size="lg" color="white" textAlign="center" mb={1}>
            Join TeamSpace
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.900" textAlign="center" mb={4}>
            Create your account to start collaborating
          </Text>
        </Flex>

        <Box
          bg={cardBg}
          p={{ base: 4, md: 6 }}
          rounded="xl"
          shadow="xl"
          w="full"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <form onSubmit={handleRegister}>
            <Tabs index={tabIndex} onChange={handleTabChange} isFitted variant="enclosed" size="sm">
              <TabList mb={4}>
                <Tab 
                  _selected={{ color: "teal.500", borderColor: "teal.500", borderBottomColor: "transparent" }}
                  onClick={() => setTabIndex(0)}
                >
                  Profile Info
                </Tab>
                <Tab 
                  _selected={{ color: "teal.500", borderColor: "teal.500", borderBottomColor: "transparent" }}
                  onClick={() => {
                    // Only allow clicking on second tab if first tab is valid
                    if (tabIndex === 1 || validateCurrentTab()) {
                      setTabIndex(1);
                    }
                  }}
                >
                  Account Setup
                </Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0} pt={2} pb={0}>
                  <VStack spacing={3}>
                    <HStack spacing={3} w="full">
                      <FormControl isInvalid={firstNameError !== ""}>
                        <FormLabel fontSize="sm" mb={1}>First Name</FormLabel>
                        <Input
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (firstNameError) setFirstNameError("");
                          }}
                          size="sm"
                        />
                        {firstNameError && <FormErrorMessage fontSize="xs">{firstNameError}</FormErrorMessage>}
                      </FormControl>
                      
                      <FormControl isInvalid={lastNameError !== ""}>
                        <FormLabel fontSize="sm" mb={1}>Last Name</FormLabel>
                        <Input
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (lastNameError) setLastNameError("");
                          }}
                          size="sm"
                        />
                        {lastNameError && <FormErrorMessage fontSize="xs">{lastNameError}</FormErrorMessage>}
                      </FormControl>
                    </HStack>

                    <FormControl isInvalid={emailError !== ""}>
                      <FormLabel fontSize="sm" mb={1}>Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        placeholder="you@example.com"
                        size="sm"
                      />
                      {emailError && <FormErrorMessage fontSize="xs">{emailError}</FormErrorMessage>}
                    </FormControl>
                    
                    <Button 
                      w="full" 
                      onClick={handleNextTab} 
                      mt={2} 
                      colorScheme="teal"
                      size="md"
                      rightIcon={tabIndex === 0 ? null : <FaArrowLeft />}
                    >
                      Next
                    </Button>
                  </VStack>
                </TabPanel>
                
                <TabPanel px={0} pt={2} pb={0}>
                  <VStack spacing={3}>
                    <FormControl isInvalid={passwordError !== ""}>
                      <FormLabel fontSize="sm" mb={1}>Password</FormLabel>
                      <InputGroup size="sm">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError("");
                          }}
                          placeholder="••••••••"
                          minLength={6}
                        />
                        <InputRightElement>
                          <IconButton
                            size="xs"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={togglePasswordVisibility}
                            variant="ghost"
                          />
                        </InputRightElement>
                      </InputGroup>
                      {passwordError && <FormErrorMessage fontSize="xs">{passwordError}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={confirmPasswordError !== ""}>
                      <FormLabel fontSize="sm" mb={1}>Confirm Password</FormLabel>
                      <InputGroup size="sm">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (confirmPasswordError) setConfirmPasswordError("");
                          }}
                          placeholder="••••••••"
                        />
                        <InputRightElement>
                          <IconButton
                            size="xs"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={toggleConfirmPasswordVisibility}
                            variant="ghost"
                          />
                        </InputRightElement>
                      </InputGroup>
                      {confirmPasswordError && <FormErrorMessage fontSize="xs">{confirmPasswordError}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={roleError !== ""}>
                      <FormLabel fontSize="sm" mb={1}>Role</FormLabel>
                      <Select
                        placeholder="Select your role"
                        value={role}
                        onChange={(e) => {
                          setRole(e.target.value);
                          if (roleError) setRoleError("");
                        }}
                        size="sm"
                      >
                        <option value="admin">Admin (create workspaces)</option>
                        <option value="member">Member (join workspaces)</option>
                      </Select>
                      {roleError && <FormErrorMessage fontSize="xs">{roleError}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={termsError !== ""}>
                      <Checkbox
                        colorScheme="teal"
                        isChecked={isTermsAccepted}
                        onChange={(e) => {
                          setIsTermsAccepted(e.target.checked);
                          if (termsError) setTermsError("");
                        }}
                        size="sm"
                      >
                        <Text fontSize="xs">
                          I agree to the{" "}
                          <Link color="teal.500" href="/terms" fontWeight="medium">
                            Terms
                          </Link>{" "}
                          and{" "}
                          <Link color="teal.500" href="/privacy" fontWeight="medium">
                            Privacy Policy
                          </Link>
                        </Text>
                      </Checkbox>
                      {termsError && <FormErrorMessage fontSize="xs">{termsError}</FormErrorMessage>}
                    </FormControl>
                    
                    <HStack spacing={3} width="full">
                      <Button
                        colorScheme="gray"
                        variant="outline"
                        width="40%"
                        size="md"
                        mt={2}
                        leftIcon={<FaArrowLeft />}
                        onClick={handlePreviousTab}
                      >
                        Back
                      </Button>
                      
                      <Button
                        colorScheme="teal"
                        type="submit"
                        width="60%"
                        isLoading={isLoading}
                        loadingText="Creating"
                        size="md"
                        mt={2}
                      >
                        Create Account
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </form>

          <Divider my={4} borderColor={borderColor} />

          <VStack spacing={3}>
            <HStack spacing={3} width="full">
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGoogle />}
                borderRadius="md"
                size="sm"
                colorScheme="teal"
              >
                Google
              </Button>
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGithub />}
                borderRadius="md"
                size="sm"
                colorScheme="teal"
              >
                GitHub
              </Button>
            </HStack>

            <Text fontSize="sm" color={textColorSecondary} textAlign="center">
              Already have an account?{" "}
              <Link
                as={RouterLink}
                to="/login"
                color="teal.500"
                fontWeight="medium"
              >
                Log in
              </Link>
            </Text>
          </VStack>
        </Box>

        <Text fontSize="xs" color="whiteAlpha.800" textAlign="center" mt={4}>
          © {new Date().getFullYear()} TeamSpace
        </Text>
      </Container>
    </Box>
  );
};

export default RegisterPage;