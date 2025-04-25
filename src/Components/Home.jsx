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
} from "@chakra-ui/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import WorkspaceCard from "../Components/WorkspaceCard";

const Home = () => {
  const { userData, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
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

    fetchWorkspaces();
  }, [userData, toast]);

  return (
    <Box p={5} maxWidth="1200px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Box>
          <Heading size="lg">Welcome, {userData?.firstName || "User"}</Heading>
          <Text color="gray.600">Your workspaces</Text>
        </Box>
        <Flex>
          {userData?.role === "admin" && (
            <Button
              colorScheme="teal"
              mr={3}
              onClick={() => navigate("/create-workspace")}
            >
              Create Workspace
            </Button>
          )}
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" p={10}>
          <Spinner size="xl" />
        </Flex>
      ) : workspaces.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" p={10} bg="gray.50" borderRadius="lg">
          <Heading size="md" mb={3}>
            No Workspaces Yet
          </Heading>
          <Text mb={5}>
            {userData?.role === "admin"
              ? "Create your first workspace to start collaborating!"
              : "Join a workspace to start collaborating!"}
          </Text>
          {userData?.role === "admin" && (
            <Button
              colorScheme="teal"
              onClick={() => navigate("/create-workspace")}
            >
              Create Workspace
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Home;
