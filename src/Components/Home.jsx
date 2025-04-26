import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  useToast,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  Icon,
  Tag,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  VStack,
  Alert,
  AlertIcon,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import WorkspaceCard from "./workspace/WorkspaceCard";
import JoinWorkspaceModal from "./JoinWorkspaceModel";
import { FiSearch, FiPlus, FiLogOut, FiFilter, FiGrid, FiList } from "react-icons/fi";

const Home = () => {
  const { userData, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      // Fetch workspaces the user has joined
      const workspaceList = [];
      if (userData?.joinedWorkspaces?.length > 0) {
        const workspacesRef = collection(db, "workspaces");
        const q = query(
          workspacesRef,
          where("id", "in", userData.joinedWorkspaces)
        );
        const workspaceSnapshot = await getDocs(q);
        workspaceSnapshot.forEach((doc) => {
          workspaceList.push({ id: doc.id, ...doc.data() });
        });
      }
      setWorkspaces(workspaceList);
      setFilteredWorkspaces(workspaceList);
    } catch (error) {
      toast({
        title: "Error fetching workspaces",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [userData, toast]);

  useEffect(() => {
    // Filter workspaces based on search term
    const results = workspaces.filter(workspace => 
      workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workspace.description && workspace.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Sort workspaces
    const sorted = [...results].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        return (b.updatedAt?.toDate() || 0) - (a.updatedAt?.toDate() || 0);
      } else if (sortBy === "members") {
        return (b.members?.length || 0) - (a.members?.length || 0);
      }
      return 0;
    });
    
    setFilteredWorkspaces(sorted);
  }, [searchTerm, workspaces, sortBy]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 2000,
    });
    navigate("/login");
  };

  const handleJoinSuccess = (workspaceId) => {
    // Refresh workspaces after joining
    fetchWorkspaces();
    
    // Navigate to the newly joined workspace after a brief delay
    setTimeout(() => {
      navigate(`/workspace/${workspaceId}`);
    }, 1000);
  };

  const getWorkspaceTags = (workspace) => {
    const tags = [];
    if (workspace.isPublic) tags.push("Public");
    if (workspace.members?.length > 10) tags.push("Popular");
    if (workspace.createdAt && (new Date() - workspace.createdAt.toDate()) < 604800000) tags.push("New");
    return tags;
  };

  return (
    <Box p={{ base: 4, md: 6 }} maxWidth="1200px" mx="auto">
      {/* Welcome Section */}
      <Flex 
        direction={{ base: "column", md: "row" }} 
        justifyContent="space-between" 
        alignItems={{ base: "flex-start", md: "center" }} 
        mb={6}
        pb={5}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <Heading size="lg" mb={1}>Welcome back, {userData?.firstName || "User"}</Heading>
          <Text color="gray.600">
            {userData?.role === "admin" 
              ? "Manage your workspaces and teams" 
              : "Collaborate with your teams"}
          </Text>
        </Box>
        <Flex>
          {userData?.role === "admin" && (
            <Button
              colorScheme="teal"
              mr={3}
              leftIcon={<FiPlus />}
              onClick={() => navigate("/create-workspace")}
              size={{ base: "sm", md: "md" }}
            >
              New Workspace
            </Button>
          )}
          <Button 
            onClick={onOpen}
            variant="outline"
            mr={3}
            size={{ base: "sm", md: "md" }}
          >
            Join Workspace
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            leftIcon={<FiLogOut />}
            size={{ base: "sm", md: "md" }}
          >
            Logout
          </Button>
        </Flex>
      </Flex>

      {/* Search and Filter Section */}
      <Flex 
        direction={{ base: "column", md: "row" }} 
        justifyContent="space-between" 
        alignItems={{ base: "stretch", md: "center" }}
        mb={6}
        gap={4}
      >
        <InputGroup maxW={{ base: "full", md: "400px" }}>
          <Input 
            placeholder="Search workspaces..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
          />
          <InputRightElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.500" />
          </InputRightElement>
        </InputGroup>
        
        <Flex gap={2}>
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<FiFilter />} 
              variant="outline"
              size={{ base: "sm", md: "md" }}
            >
              Sort: {sortBy === "name" ? "A-Z" : sortBy === "recent" ? "Recent" : "Members"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSortBy("name")}>Alphabetical</MenuItem>
              <MenuItem onClick={() => setSortBy("recent")}>Most Recent</MenuItem>
              <MenuItem onClick={() => setSortBy("members")}>Most Members</MenuItem>
            </MenuList>
          </Menu>
          
          <HStack spacing={0} borderWidth="1px" borderRadius="md" overflow="hidden">
            <IconButton 
              icon={<FiGrid />} 
              aria-label="Grid view" 
              variant={viewMode === "grid" ? "solid" : "outline"}
              colorScheme={viewMode === "grid" ? "teal" : "gray"}
              borderRadius="0"
              size={{ base: "sm", md: "md" }}
              onClick={() => setViewMode("grid")}
            />
            <IconButton 
              icon={<FiList />} 
              aria-label="List view" 
              variant={viewMode === "list" ? "solid" : "outline"}
              colorScheme={viewMode === "list" ? "teal" : "gray"}
              borderRadius="0"
              size={{ base: "sm", md: "md" }}
              onClick={() => setViewMode("list")}
            />
          </HStack>
        </Flex>
      </Flex>

      {/* Workspace Content */}
      {loading ? (
        <Flex justifyContent="center" alignItems="center" p={10} minH="300px">
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Flex>
      ) : filteredWorkspaces.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard 
                  key={workspace.id} 
                  workspace={workspace} 
                  tags={getWorkspaceTags(workspace)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <VStack spacing={4} align="stretch">
              {filteredWorkspaces.map((workspace) => (
                <Flex 
                  key={workspace.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg={bgColor}
                  borderColor={borderColor}
                  align="center"
                  justify="space-between"
                  transition="all 0.2s"
                  _hover={{ shadow: "md", borderColor: "teal.300" }}
                  onClick={() => navigate(`/workspace/${workspace.id}`)}
                  cursor="pointer"
                >
                  <Box>
                    <Heading size="md" mb={1}>{workspace.name}</Heading>
                    <Text color="gray.600" noOfLines={1} mb={2}>
                      {workspace.description || "No description provided"}
                    </Text>
                    <HStack>
                      {getWorkspaceTags(workspace).map((tag, index) => (
                        <Tag key={index} size="sm" colorScheme={tag === "Public" ? "green" : tag === "Popular" ? "purple" : "blue"}>
                          {tag}
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                  <Text color="gray.500" fontSize="sm">
                    {workspace.members?.length || 0} members
                  </Text>
                </Flex>
              ))}
            </VStack>
          )}
        </>
      ) : (
        <Box 
          textAlign="center" 
          p={10} 
          bg={useColorModeValue("gray.50", "gray.700")} 
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          {searchTerm ? (
            <>
              <Heading size="md" mb={3}>
                No matching workspaces
              </Heading>
              <Text mb={5}>
                Try adjusting your search term or clear the filter.
              </Text>
              <Button onClick={() => setSearchTerm("")} colorScheme="teal" variant="outline">
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <Heading size="md" mb={3}>
                No Workspaces Yet
              </Heading>
              <Text mb={5}>
                {userData?.role === "admin"
                  ? "Create your first workspace to start collaborating!"
                  : "Join a workspace to start collaborating!"}
              </Text>
              <HStack spacing={4} justifyContent="center">
                {userData?.role === "admin" && (
                  <Button
                    colorScheme="teal"
                    onClick={() => navigate("/create-workspace")}
                    leftIcon={<FiPlus />}
                  >
                    Create Workspace
                  </Button>
                )}
                <Button
                  colorScheme="teal"
                  variant="outline"
                  onClick={onOpen}
                >
                  Join Workspace
                </Button>
              </HStack>
            </>
          )}
        </Box>
      )}

      {/* Join workspace modal */}
      <JoinWorkspaceModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onSuccess={handleJoinSuccess}
      />
    </Box>
  );
};

export default Home;