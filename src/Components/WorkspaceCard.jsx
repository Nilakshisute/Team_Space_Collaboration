import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const WorkspaceCard = ({ workspace }) => {
  const navigate = useNavigate();

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
    >
      <Heading size="md" mb={2}>
        {workspace.name}
      </Heading>
      <Text mb={4} noOfLines={2} color="gray.600">
        {workspace.description || "No description available"}
      </Text>
      <Button
        colorScheme="teal"
        size="sm"
        onClick={() => navigate(`/workspace/${workspace.id}`)}
      >
        Open Workspace
      </Button>
    </Box>
  );
};

export default WorkspaceCard;
