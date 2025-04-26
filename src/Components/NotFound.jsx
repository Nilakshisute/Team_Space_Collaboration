import React from "react";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Image, 
  VStack,
  useColorModeValue 
} from "@chakra-ui/react";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
      <Box 
        textAlign="center" 
        p={8} 
        maxW="500px" 
        borderRadius="lg" 
        boxShadow="lg" 
        bg={cardBg}
      >
        <VStack spacing={6}>
          <Box fontSize="9xl" fontWeight="bold" color="teal.500" lineHeight="1">
            404
          </Box>
          
          <Heading size="xl">
            Page Not Found
          </Heading>
          
          <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.400")}>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          
          <Flex gap={4} mt={2}>
            <Button 
              leftIcon={<FiArrowLeft />}
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            
            <Button 
              colorScheme="teal" 
              leftIcon={<FiHome />}
              onClick={() => navigate("/home")}
            >
              Go to Home
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  );
};

export default NotFound;