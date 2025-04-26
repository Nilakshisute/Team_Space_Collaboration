import React from "react";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  HStack, 
  Badge, 
  Icon, 
  Avatar, 
  AvatarGroup,
  Flex,
  Tooltip,
  IconButton,
  useColorModeValue 
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiStar, FiCalendar, FiMoreVertical } from "react-icons/fi";

const WorkspaceCard = ({ workspace, tags = [] }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBorderColor = useColorModeValue("teal.300", "teal.400");
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Get member count display
  const getMemberCount = () => {
    const count = workspace.members?.length || 0;
    if (count === 0) return "No members";
    if (count === 1) return "1 member";
    return `${count} members`;
  };
  
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      boxShadow="sm"
      bg={cardBg}
      transition="all 0.2s"
      _hover={{ 
        transform: "translateY(-4px)", 
        boxShadow: "md",
        borderColor: hoverBorderColor 
      }}
      position="relative"
      overflow="hidden"
    >
      {/* Optional ribbon for special workspaces */}
      {workspace.featured && (
        <Box
          position="absolute"
          top="0"
          right="0"
          bg="teal.500"
          color="white"
          px={3}
          py={1}
          transform="rotate(45deg) translateX(20px) translateY(-14px)"
          width="140px"
          textAlign="center"
          fontWeight="bold"
          fontSize="xs"
        >
          FEATURED
        </Box>
      )}
      
      <HStack mb={3} justifyContent="space-between">
        <Heading size="md" noOfLines={1}>
          {workspace.name}
        </Heading>
        
        <IconButton
          icon={<FiMoreVertical />}
          variant="ghost"
          size="sm"
          aria-label="More options"
          onClick={(e) => {
            e.stopPropagation();
            // Menu functionality would go here
          }}
        />
      </HStack>
      
      <Text mb={4} noOfLines={2} color="gray.600" fontSize="sm" height="40px">
        {workspace.description || "No description available"}
      </Text>
      
      {/* Tags */}
      <HStack mb={4} flexWrap="wrap" spacing={2}>
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            colorScheme={tag === "Public" ? "green" : tag === "Popular" ? "purple" : "blue"}
            variant="subtle"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
          >
            {tag}
          </Badge>
        ))}
      </HStack>
      
      {/* Workspace stats */}
      <HStack mb={4} spacing={4} fontSize="sm" color="gray.500">
        <Flex align="center">
          <Icon as={FiUsers} mr={1} />
          <Text>{getMemberCount()}</Text>
        </Flex>
        
        <Flex align="center">
          <Icon as={FiCalendar} mr={1} />
          <Text>{formatDate(workspace.updatedAt || workspace.createdAt)}</Text>
        </Flex>
      </HStack>
      
      {/* Members preview */}
      <Flex justify="space-between" align="center" mb={4}>
        <AvatarGroup size="xs" max={3}>
          {workspace.memberProfiles ? (
            workspace.memberProfiles.map((member, idx) => (
              <Tooltip key={idx} label={member.name || "Team member"}>
                <Avatar 
                  name={member.name} 
                  src={member.photoURL} 
                  size="xs" 
                />
              </Tooltip>
            ))
          ) : (
            <Avatar name={workspace.name} size="xs" />
          )}
        </AvatarGroup>
      </Flex>
      
      <Button
        colorScheme="teal"
        size="sm"
        width="full"
        onClick={() => navigate(`/workspace/${workspace.id}`)}
      >
        Open Workspace
      </Button>
    </Box>
  );
};

export default WorkspaceCard;