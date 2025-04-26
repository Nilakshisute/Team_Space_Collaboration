import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Badge,
  Text,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Avatar,
  Tag,
  TagLabel,
  IconButton,
  Tooltip,
  AvatarGroup,
  useClipboard,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  VStack,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  InputGroup,
  InputRightElement,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  Radio
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import DocumentsTab from "./workspace/DocumentsTab";
import MembersTab from "./workspace/MembersTab";
import { 
  FiHome, 
  FiChevronRight, 
  FiSettings, 
  FiMoreVertical, 
  FiShare2, 
  FiStar, 
  FiTrash2, 
  FiCopy, 
  FiCheck, 
  FiUser, 
  FiUsers, 
  FiFile, 
  FiActivity,
  FiCalendar,
  FiMessageSquare,
  FiInfo,
  FiAlertCircle,
  FiBell,
  FiBookmark,
  FiLock
} from "react-icons/fi";

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const { userData } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [members, setMembers] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  
  const toast = useToast();
  const navigate = useNavigate();
  const deleteDialog = useDisclosure();
  const shareModal = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(inviteCode);
  const cancelRef = React.useRef();
  
  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.750");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const subtleText = useColorModeValue("gray.600", "gray.400");
  const tagBg = useColorModeValue("gray.100", "gray.700");
  const highlightColor = useColorModeValue("teal.50", "teal.900");
  
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const workspaceDoc = await getDoc(doc(db, "workspaces", id));
        if (!workspaceDoc.exists()) {
          toast({
            title: "Workspace not found",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top"
          });
          navigate("/home");
          return;
        }
        
        const workspaceData = { id: workspaceDoc.id, ...workspaceDoc.data() };
        
        // Check if user is a member of this workspace
        if (!workspaceData.members.includes(userData.uid) && workspaceData.createdBy !== userData.uid) {
          toast({
            title: "Access denied",
            description: "You don't have access to this workspace",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top"
          });
          navigate("/home");
          return;
        }
        
        setWorkspace(workspaceData);
        
        // Generate invite code
        setInviteCode(`${window.location.origin}/invite/${workspaceData.id}`);
        
        // Get user's favorite workspaces from localStorage
        const storedFavorites = localStorage.getItem('favoriteWorkspaces');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
        
        // Fetch recent documents (simple version)
        fetchRecentDocuments(workspaceData.id);
        
        // Mock recent activities data
        setRecentActivities([
          { 
            id: 1, 
            type: 'document', 
            action: 'created', 
            user: 'Alex Smith', 
            item: 'Q4 Marketing Plan', 
            timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
          },
          { 
            id: 2, 
            type: 'member', 
            action: 'joined', 
            user: 'Taylor Wong', 
            item: 'the workspace', 
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
          },
          { 
            id: 3, 
            type: 'document', 
            action: 'edited', 
            user: 'Jamie Lee', 
            item: 'Product Roadmap', 
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          }
        ]);
      } catch (error) {
        toast({
          title: "Error fetching workspace",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspace();
  }, [id, userData, navigate, toast]);
  
  const fetchRecentDocuments = async (workspaceId) => {
    try {
      const documentsRef = collection(db, "workspaces", workspaceId, "documents");
      const q = query(documentsRef, orderBy("updatedAt", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setRecentDocuments(documents);
    } catch (error) {
      console.error("Error fetching recent documents:", error);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspace || !workspace.members) return;
      
      try {
        setLoadingMembers(true);
        const memberPromises = workspace.members.slice(0, 10).map(memberId => 
          getDoc(doc(db, "users", memberId))
        );
        
        const memberDocs = await Promise.all(memberPromises);
        const memberData = memberDocs.map(doc => {
          if (doc.exists()) {
            return { id: doc.id, ...doc.data() };
          }
          return null;
        }).filter(Boolean);
        
        setMembers(memberData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoadingMembers(false);
      }
    };
    
    fetchMembers();
  }, [workspace]);

  const toggleFavorite = () => {
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
      toast({
        title: "Removed from favorites",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    } else {
      newFavorites = [...favorites, id];
      toast({
        title: "Added to favorites",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteWorkspaces', JSON.stringify(newFavorites));
  };
  
  const handleDeleteWorkspace = async () => {
    try {
      if (workspace.createdBy !== userData.uid) {
        toast({
          title: "Permission denied",
          description: "Only workspace creator can delete this workspace",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        return;
      }
      
      await deleteDoc(doc(db, "workspaces", id));
      toast({
        title: "Workspace deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      navigate("/home");
    } catch (error) {
      toast({
        title: "Error deleting workspace",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    } finally {
      deleteDialog.onClose();
    }
  };

  const handleShareWorkspace = () => {
    shareModal.onOpen();
  };
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'document': return FiFile;
      case 'member': return FiUser;
      default: return FiActivity;
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh" direction="column" gap={4}>
        <Spinner size="xl" thickness="4px" color="teal.500" />
        <Text color="gray.500">Loading workspace...</Text>
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto">
      {/* Header Section - FIXED: Position static instead of sticky */}
      <Box 
        bg={headerBg} 
        p={5} 
        borderBottom="1px" 
        borderColor={borderColor}
        shadow="sm"
      >
        <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />} mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink as="button" onClick={() => navigate("/home")}>
              <HStack>
                <Icon as={FiHome} />
                <Text>Home</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <HStack>
                <Text>{workspace?.name}</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      
        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <HStack spacing={3}>
            <Heading size="lg">{workspace?.name}</Heading>
            {workspace?.isPublic ? (
              <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="md">
                <HStack spacing={1}>
                  <Icon as={FiUsers} fontSize="xs" />
                  <Text>Public</Text>
                </HStack>
              </Badge>
            ) : (
              <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="md">
                <HStack spacing={1}>
                  <Icon as={FiLock} fontSize="xs" />
                  <Text>Private</Text>
                </HStack>
              </Badge>
            )}
            
            <Tooltip label={workspace?.createdBy === userData.uid ? "You created this workspace" : "Workspace owner"}>
              <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="blue">
                <Icon as={FiInfo} mr={1} />
                <TagLabel>{workspace?.createdBy === userData.uid ? "Owner" : "Member"}</TagLabel>
              </Tag>
            </Tooltip>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label={favorites.includes(id) ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                aria-label="Favorite"
                icon={<Icon as={FiStar} />}
                colorScheme={favorites.includes(id) ? "yellow" : "gray"}
                variant={favorites.includes(id) ? "solid" : "ghost"}
                onClick={toggleFavorite}
                size="md"
              />
            </Tooltip>
            
            <Button 
              leftIcon={<FiShare2 />} 
              variant="outline"
              colorScheme="teal"
              onClick={handleShareWorkspace}
              size="md"
            >
              Share
            </Button>
            
            <Menu placement="bottom-end">
              <MenuButton 
                as={IconButton} 
                icon={<FiMoreVertical />}
                variant="ghost"
                aria-label="More options"
                size="md"
              />
              <MenuList>
                <MenuItem icon={<FiSettings />}>Workspace Settings</MenuItem>
                <MenuItem icon={<FiBell />}>Notification Settings</MenuItem>
                {workspace?.createdBy === userData.uid && (
                  <>
                    <Divider />
                    <MenuItem icon={<FiTrash2 />} color="red.500" onClick={deleteDialog.onOpen}>
                      Delete Workspace
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Text mt={2} color={subtleText} fontSize="md">
          {workspace?.description || "No description available"}
        </Text>
        
        <HStack mt={4} spacing={4} wrap="wrap">
          {!loadingMembers && (
            <AvatarGroup size="sm" max={5}>
              {members.map(member => (
                <Tooltip key={member.id} label={`${member.firstName} ${member.lastName}`} placement="top">
                  <Avatar 
                    name={`${member.firstName} ${member.lastName}`} 
                    src={member.photoURL}
                    bg="teal.500"
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
          
          <Text fontSize="sm" color={subtleText}>
            {workspace?.members?.length} member{workspace?.members?.length !== 1 ? 's' : ''}
          </Text>
          
          <Divider orientation="vertical" height="20px" />
          
          <HStack>
            <Icon as={FiCalendar} color={subtleText} />
            <Text fontSize="sm" color={subtleText}>
              Created {new Date(workspace?.createdAt?.toDate()).toLocaleDateString()}
            </Text>
          </HStack>
        </HStack>
      </Box>
      
      {/* Main Content - FIXED: Moved Tabs outside the content area for better visibility */}
      <Box>
        {/* Tabs are now outside the content area and clearly visible */}
        <Tabs colorScheme="teal" isLazy variant="line" size="md">
          <TabList px={5} pt={4} bg={headerBg} borderBottom="1px" borderColor={borderColor}>
            <Tab _selected={{ color: "teal.500", borderColor: "teal.500", fontWeight: "semibold" }}>Dashboard</Tab>
            <Tab _selected={{ color: "teal.500", borderColor: "teal.500", fontWeight: "semibold" }}>Documents</Tab>
            <Tab _selected={{ color: "teal.500", borderColor: "teal.500", fontWeight: "semibold" }}>Members</Tab>
            {workspace?.createdBy === userData.uid && (
              <Tab _selected={{ color: "teal.500", borderColor: "teal.500", fontWeight: "semibold" }}>Settings</Tab>
            )}
          </TabList>
          
          <TabPanels>
            {/* Dashboard Tab */}
            <TabPanel p={5}>
              <Grid 
                templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                gap={6}
              >
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* Recent Activity Section */}
                    <Card variant="outline" shadow="sm">
                      <CardHeader pb={0}>
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Recent Activity</Heading>
                          <Button variant="ghost" size="sm" rightIcon={<FiChevronRight />}>
                            View all
                          </Button>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          {recentActivities.map(activity => (
                            <HStack 
                              key={activity.id} 
                              p={3} 
                              borderRadius="md" 
                              borderWidth="1px" 
                              borderColor={borderColor}
                              _hover={{ bg: hoverBg }}
                              transition="background 0.2s"
                            >
                              <Flex 
                                justify="center" 
                                align="center" 
                                borderRadius="full" 
                                bg={highlightColor} 
                                color="teal.500" 
                                boxSize="40px"
                              >
                                <Icon as={getActivityIcon(activity.type)} fontSize="lg" />
                              </Flex>
                              <Box flex="1">
                                <Text fontWeight="medium">
                                  <Text as="span" fontWeight="bold">{activity.user}</Text>
                                  {' '}{activity.action}{' '}
                                  <Text as="span" fontWeight="bold">{activity.item}</Text>
                                </Text>
                                <Text fontSize="sm" color={subtleText}>
                                  {formatTimeAgo(activity.timestamp)}
                                </Text>
                              </Box>
                            </HStack>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                    
                    {/* Recent Documents Section */}
                    <Card variant="outline" shadow="sm">
                      <CardHeader pb={0}>
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Recent Documents</Heading>
                          <Button variant="ghost" size="sm" rightIcon={<FiChevronRight />}>
                            View all
                          </Button>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        {recentDocuments.length > 0 ? (
                          <Stack spacing={3}>
                            {recentDocuments.map((doc) => (
                              <HStack 
                                key={doc.id} 
                                p={3} 
                                borderRadius="md" 
                                borderWidth="1px" 
                                borderColor={borderColor}
                                _hover={{ bg: hoverBg, cursor: "pointer" }}
                                transition="all 0.2s"
                                onClick={() => navigate(`/document/${doc.id}`)}
                              >
                                <Icon as={FiFile} fontSize="xl" color="teal.500" />
                                <Box flex="1">
                                  <Text fontWeight="medium">{doc.title}</Text>
                                  <Text fontSize="sm" color={subtleText}>
                                    Updated {doc.updatedAt ? formatTimeAgo(doc.updatedAt.toDate()) : "recently"}
                                  </Text>
                                </Box>
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  icon={<FiBookmark />}
                                  aria-label="Bookmark document"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Add bookmark functionality
                                    toast({
                                      title: "Document bookmarked",
                                      status: "success",
                                      duration: 2000,
                                      isClosable: true,
                                    });
                                  }}
                                />
                              </HStack>
                            ))}
                          </Stack>
                        ) : (
                          <Flex 
                            direction="column" 
                            align="center" 
                            justify="center" 
                            py={8} 
                            bg={hoverBg} 
                            borderRadius="md"
                          >
                            <Icon as={FiFile} fontSize="3xl" color={subtleText} mb={3} />
                            <Text color={subtleText}>No documents yet</Text>
                            <Button 
                              mt={4} 
                              colorScheme="teal" 
                              leftIcon={<FiFile />}
                              size="sm"
                              onClick={() => {
                                // Navigate to create document or open modal
                              }}
                            >
                              Create Document
                            </Button>
                          </Flex>
                        )}
                      </CardBody>
                    </Card>
                  </VStack>
                </GridItem>
                
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* Workspace Stats */}
                    <Card variant="outline" shadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="md">Workspace Stats</Heading>
                      </CardHeader>
                      <CardBody>
                        <StatGroup>
                          <Stat>
                            <StatLabel>Members</StatLabel>
                            <StatNumber>{workspace?.members?.length || 0}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              23% growth
                            </StatHelpText>
                          </Stat>
                          
                          <Stat>
                            <StatLabel>Documents</StatLabel>
                            <StatNumber>{recentDocuments.length}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              12% increase
                            </StatHelpText>
                          </Stat>
                        </StatGroup>
                        
                        <Box mt={6}>
                          <Text mb={2} fontSize="sm" fontWeight="medium">Storage Usage</Text>
                          <Progress value={40} size="sm" colorScheme="teal" borderRadius="full" />
                          <Flex justify="space-between" mt={1}>
                            <Text fontSize="xs" color={subtleText}>4.2 GB used</Text>
                            <Text fontSize="xs" color={subtleText}>10 GB total</Text>
                          </Flex>
                        </Box>
                      </CardBody>
                    </Card>
                    
                    {/* Quick Actions */}
                    <Card variant="outline" shadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="md">Quick Actions</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Button 
                            leftIcon={<FiFile />} 
                            colorScheme="teal"
                            justifyContent="flex-start"
                            size="md"
                            onClick={() => {
                              // Navigate to create document
                            }}
                          >
                            Create New Document
                          </Button>
                          
                          <Button 
                            leftIcon={<FiUsers />} 
                            variant="outline"
                            justifyContent="flex-start"
                            size="md"
                            onClick={handleShareWorkspace}
                          >
                            Invite Members
                          </Button>
                          
                          <Button 
                            leftIcon={<FiMessageSquare />} 
                            variant="outline"
                            justifyContent="flex-start"
                            size="md"
                            onClick={() => {
                              // Open chat or discussion
                            }}
                          >
                            Team Discussion
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </GridItem>
              </Grid>
            </TabPanel>
            
            {/* Documents Tab */}
            <TabPanel p={5}>
              <DocumentsTab
                workspaceId={id}
                isAdmin={workspace.createdBy === userData.uid}
              />
            </TabPanel>
            
            {/* Members Tab */}
            <TabPanel p={5}>
              <MembersTab
                workspaceId={id}
                isAdmin={workspace.createdBy === userData.uid}
                currentUser={userData.uid}
              />
            </TabPanel>
            
            {/* Settings Tab */}
            {workspace?.createdBy === userData.uid && (
              <TabPanel p={5}>
                <Card variant="outline" shadow="sm" p={4}>
                  <CardHeader>
                    <Heading size="md">Workspace Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="start">
                      <FormControl>
                        <FormLabel>Workspace Name</FormLabel>
                        <Input defaultValue={workspace?.name} />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Workspace Description</FormLabel>
                        <Textarea 
                          defaultValue={workspace?.description || ""} 
                          placeholder="Add a description for your workspace"
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="is-public" mb="0">
                          Public Workspace
                        </FormLabel>
                        <Switch 
                          id="is-public" 
                          colorScheme="teal" 
                          isChecked={workspace?.isPublic || false}
                        />
                      </FormControl>
                      
                      <Box w="full">
                        <Heading size="sm" mb={3}>Permissions</Heading>
                        <VStack align="start" spacing={3}>
                          <CheckboxGroup defaultValue={["admin-invite", "member-edit"]}>
                            <Checkbox value="admin-invite">Allow admins to invite members</Checkbox>
                            <Checkbox value="member-edit">Allow members to edit documents</Checkbox>
                            <Checkbox value="viewer-comment">Allow viewers to comment</Checkbox>
                          </CheckboxGroup>
                        </VStack>
                      </Box>
                      
                      <Button colorScheme="teal" alignSelf="end">
                        Save Changes
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card variant="outline" shadow="sm" p={4} mt={6}>
                  <CardHeader>
                    <Heading size="md" color="red.500">Danger Zone</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="start">
                      <Text>These actions cannot be undone. Please proceed with caution.</Text>
                      
                      <Button 
                        leftIcon={<FiTrash2 />} 
                        colorScheme="red" 
                        variant="outline"
                        onClick={deleteDialog.onOpen}
                      >
                        Delete Workspace
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Delete Workspace Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDialog.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Workspace
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={FiAlertCircle} color="red.500" fontSize="xl" />
                  <Text fontWeight="medium">This action cannot be undone.</Text>
                </HStack>
                
                <Text>
                  All documents and data associated with <strong>{workspace?.name}</strong> will be permanently deleted.
                </Text>
                
                <Input 
                  placeholder="Type 'delete' to confirm" 
                  size="sm"
                  // Add validation logic if needed
                />
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDialog.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteWorkspace} ml={3}>
                Delete Workspace
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
          </AlertDialogOverlay>
      </AlertDialog>
      
      {/* Share Workspace Modal */}
      <Modal isOpen={shareModal.isOpen} onClose={shareModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Workspace</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={5} align="start">
              <Text>
                Share this link with others to invite them to join <strong>{workspace?.name}</strong>.
              </Text>
              
              <InputGroup>
                <Input
                  value={inviteCode}
                  isReadOnly
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button 
                    h="1.75rem" 
                    size="sm" 
                    onClick={onCopy}
                    colorScheme="teal"
                  >
                    {hasCopied ? <Icon as={FiCheck} /> : <Icon as={FiCopy} />}
                  </Button>
                </InputRightElement>
              </InputGroup>

              <RadioGroup defaultValue="view">
                <VStack align="start" spacing={2}>
                  <Text fontWeight="medium">Permission level:</Text>
                  <Radio value="view">View only</Radio>
                  <Radio value="edit">Can edit</Radio>
                  <Radio value="admin">Admin access</Radio>
                </VStack>
              </RadioGroup>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={shareModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" leftIcon={<FiShare2 />}>
              Copy & Share
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WorkspaceDashboard;