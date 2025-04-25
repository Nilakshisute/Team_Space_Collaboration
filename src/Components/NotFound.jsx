import React from "react";
import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box textAlign="center" p={8}>
        <Heading size="xl" mb={4}>
          Page Not Found
        </Heading>
        <Text fontSize="lg" mb={6}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button colorScheme="teal" onClick={() => navigate("/home")}>
          Go to Home
        </Button>
      </Box>
    </Flex>
  );
};

export default NotFound;
