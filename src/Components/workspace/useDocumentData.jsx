// Components/workspace/useDocumentData.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust path as needed for your project

export const useDocumentData = ({
  documentId,
  workspaceId,
  content,
  documentName,
  userData,
  setContent,
  setDocumentName,
  setLastSaved,
  toast,
  navigate,
  onRenameClose
}) => {
  const [document, setDocument] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [currentEditor, setCurrentEditor] = useState(null);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    
    // Check if date is a timestamp or Date object
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    
    // Check if the date is today
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    
    if (isToday) {
      return `today at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `yesterday at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise return full date
    return dateObj.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch document and workspace data
  useEffect(() => {
    if (!documentId || !workspaceId || !userData) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get document reference
        const docRef = doc(db, "documents", documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          toast({
            title: "Document not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate(`/workspace/${workspaceId}`);
          return;
        }
        
        const docData = docSnap.data();
        
        // Check permissions
        if (docData.workspaceId !== workspaceId) {
          toast({
            title: "Access denied",
            description: "This document does not belong to the specified workspace",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate(`/workspace/${workspaceId}`);
          return;
        }
        
        // Get workspace data
        const wsRef = doc(db, "workspaces", workspaceId);
        const wsSnap = await getDoc(wsRef);
        
        if (!wsSnap.exists()) {
          toast({
            title: "Workspace not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate('/home');
          return;
        }
        
        const wsData = wsSnap.data();
        
        // Verify user has access to workspace
        if (wsData.ownerId !== userData.uid && 
            !wsData.members?.includes(userData.uid)) {
          toast({
            title: "Access denied",
            description: "You don't have access to this workspace",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate('/home');
          return;
        }
        
        // Set document and workspace data
        setDocument(docData);
        setWorkspace(wsData);
        setContent(docData.content || "");
        setDocumentName(docData.name || "Untitled Document");
        setLastSaved(docData.updatedAt || null);
        
        // Fetch collaborators data
        const collaboratorList = [];
        
        // Add owner
        if (wsData.ownerId) {
          const ownerRef = doc(db, "users", wsData.ownerId);
          const ownerSnap = await getDoc(ownerRef);
          if (ownerSnap.exists()) {
            collaboratorList.push({
              id: wsData.ownerId,
              name: ownerSnap.data().displayName || "Owner",
              isCurrentUser: wsData.ownerId === userData.uid
            });
          }
        }
        
        // Add members if they exist
        if (wsData.members && wsData.members.length > 0) {
          for (const memberId of wsData.members) {
            // Skip if member is already processed (e.g., owner)
            if (collaboratorList.some(c => c.id === memberId)) continue;
            
            const memberRef = doc(db, "users", memberId);
            const memberSnap = await getDoc(memberRef);
            if (memberSnap.exists()) {
              collaboratorList.push({
                id: memberId,
                name: memberSnap.data().displayName || "Member",
                isCurrentUser: memberId === userData.uid
              });
            }
          }
        }
        
        setCollaborators(collaboratorList);
        
      } catch (error) {
        console.error("Error fetching document data:", error);
        toast({
          title: "Error loading document",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Setup real-time listeners for document changes
    const docRef = doc(db, "documents", documentId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data();
        // Don't update content while the user is editing (to prevent editor jumps)
        setDocument(docData);
        setDocumentName(docData.name || "Untitled Document");
        setLastSaved(docData.updatedAt || null);
        
        // Update current editor status
        setCurrentEditor(docData.currentEditor || null);
      }
    });
    
    // Set current editor when component mounts
    const updateCurrentEditor = async () => {
      try {
        await updateDoc(docRef, {
          currentEditor: userData.uid,
          lastActivity: new Date()
        });
      } catch (error) {
        console.error("Error updating current editor:", error);
      }
    };
    
    updateCurrentEditor();
    
    // Clear current editor when component unmounts
    return () => {
      unsubscribe();
      const clearCurrentEditor = async () => {
        try {
          await updateDoc(docRef, {
            currentEditor: null
          });
        } catch (error) {
          console.error("Error clearing current editor:", error);
        }
      };
      
      clearCurrentEditor();
    };
  }, [documentId, workspaceId, userData, navigate, toast]);

  // Function to save document
  const handleSave = async (isAutoSave = false) => {
    if (!documentId || !userData) return;
    
    try {
      setSaving(true);
      
      const docRef = doc(db, "documents", documentId);
      
      await updateDoc(docRef, {
        content: content,
        updatedAt: new Date(),
        updatedBy: userData.uid
      });
      
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        toast({
          title: "Document saved",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to rename document
  const handleRename = async (newName) => {
    if (!documentId || !userData || !newName.trim()) return;
    
    try {
      setSaving(true);
      
      const docRef = doc(db, "documents", documentId);
      
      await updateDoc(docRef, {
        name: newName.trim(),
        updatedAt: new Date(),
        updatedBy: userData.uid
      });
      
      setDocumentName(newName.trim());
      setLastSaved(new Date());
      
      toast({
        title: "Document renamed",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      onRenameClose();
    } catch (error) {
      console.error("Error renaming document:", error);
      toast({
        title: "Error renaming document",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    document,
    workspace,
    loading,
    saving,
    setSaving,
    collaborators,
    currentEditor,
    handleSave,
    handleRename,
    formatDate
  };
};