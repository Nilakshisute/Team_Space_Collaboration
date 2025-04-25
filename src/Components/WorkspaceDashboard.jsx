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
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import DocumentsTab from "./workspace/DocumentsTab";
import MembersTab from "./workspace/MembersTab";

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const { userData } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const workspaceDoc = await getDoc(doc(db, "workspaces", id));

        if (!workspaceDoc.exists()) {
          toast({
            title: "Workspace not found",
            status: "error",
            duration: 3000,
          });
          navigate("/home");
          return;
        }

        const workspaceData = { id: workspaceDoc.id, ...workspaceDoc.data() };

        // Check if user is a member of this workspace
        if (!workspaceData.members.includes(userData.uid)) {
          toast({
            title: "Access denied",
            description: "You are not a member of this workspace",
            status: "error",
            duration: 3000,
          });
          navigate("/home");
          return;
        }

        setWorkspace(workspaceData);
      } catch (error) {
        toast({
          title: "Error fetching workspace",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [id, userData, navigate, toast]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={5} maxW="1200px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{workspace?.name}</Heading>
        <Button variant="outline" onClick={() => navigate("/home")}>
          Back to Home
        </Button>
      </Flex>

      <Tabs colorScheme="teal" isLazy>
        <TabList>
          <Tab>Documents</Tab>
          <Tab>Members</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <DocumentsTab
              workspaceId={id}
              isAdmin={workspace.createdBy === userData.uid}
            />
          </TabPanel>
          <TabPanel>
            <MembersTab
              workspaceId={id}
              isAdmin={workspace.createdBy === userData.uid}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default WorkspaceDashboard;
