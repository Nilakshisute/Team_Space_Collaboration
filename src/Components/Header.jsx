// import React from "react";
// import { SunIcon, MoonIcon, SearchIcon, BellIcon } from "@chakra-ui/icons";
// import {
//   Flex,
//   Box,
//   Heading,
//   useColorMode,
//   useColorModeValue,
//   IconButton,
//   HStack,
//   Avatar,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   MenuDivider,
//   Button,
//   useBreakpointValue,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Badge,
//   Image,
//   Container,
//   Drawer,
//   DrawerBody,
//   DrawerHeader,
//   DrawerOverlay,
//   DrawerContent,
//   DrawerCloseButton,
//   useDisclosure,
//   VStack,
// } from "@chakra-ui/react";
// import { FiMenu, FiHome, FiUsers, FiSettings, FiLogOut, FiMessageSquare } from "react-icons/fi";
// import { Link, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Header = () => {
//   const { colorMode, toggleColorMode } = useColorMode();
//   const { userData, logout } = useAuth();
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const location = useLocation();

//   const bg = useColorModeValue("white", "gray.900");
//   const borderColor = useColorModeValue("gray.200", "gray.700");
//   const headingColor = useColorModeValue("teal.600", "teal.200");
//   const navBg = useColorModeValue("white", "gray.800");

//   const isMobile = useBreakpointValue({ base: true, md: false });
//   const logoText = useBreakpointValue({ base: "TS", md: "TeamSpace" });

//   const navItems = [
//     { name: "Home", icon: FiHome, path: "/home" },
//     { name: "Messages", icon: FiMessageSquare, path: "/messages", badge: 3 },
//     { name: "Team", icon: FiUsers, path: "/team" },
//     { name: "Settings", icon: FiSettings, path: "/settings" },
//   ];

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const NavigationItems = ({ direction = "row", spacing = 4, onItemClick = null }) => (
//     <Flex direction={direction} align={direction === "column" ? "stretch" : "center"} spacing={spacing}>
//       {navItems.map((item) => (
//         <Button
//           key={item.name}
//           as={Link}
//           to={item.path}
//           variant={isActive(item.path) ? "solid" : "ghost"}
//           colorScheme={isActive(item.path) ? "teal" : "gray"}
//           leftIcon={<item.icon />}
//           size={direction === "column" ? "md" : "sm"}
//           justifyContent={direction === "column" ? "flex-start" : "center"}
//           mb={direction === "column" ? 2 : 0}
//           onClick={onItemClick}
//           position="relative"
//         >
//           {item.name}
//           {item.badge && (
//             <Badge
//               colorScheme="red"
//               borderRadius="full"
//               position="absolute"
//               top="-2px"
//               right="-2px"
//               fontSize="xs"
//               zIndex={1}
//             >
//               {item.badge}
//             </Badge>
//           )}
//         </Button>
//       ))}
//     </Flex>
//   );

//   return (
//     <Box
//       bg={bg}
//       boxShadow="sm"
//       position="sticky"
//       top="0"
//       zIndex="sticky"
//       borderBottom="1px"
//       borderColor={borderColor}
//     >
//       <Container maxW="1200px" px={4}>
//         <Flex align="center" justify="space-between" h="60px">
//           {/* Logo and Mobile Menu Button */}
//           <HStack spacing={4}>
//             {isMobile && (
//               <IconButton
//                 icon={<FiMenu />}
//                 variant="ghost"
//                 onClick={onOpen}
//                 aria-label="Open menu"
//               />
//             )}

//             <Link to="/home">
//               <HStack>
//                 <Box
//                   bg="teal.500"
//                   color="white"
//                   p={2}
//                   rounded="md"
//                   display="flex"
//                   alignItems="center"
//                   justifyContent="center"
//                   h="32px"
//                   w={isMobile ? "32px" : "auto"}
//                   fontWeight="bold"
//                 >
//                   {logoText}
//                 </Box>
//                 {!isMobile && (
//                   <Heading size="md" color={headingColor}>TeamSpace</Heading>
//                 )}
//               </HStack>
//             </Link>
//           </HStack>

//           {/* Desktop Navigation */}
//           {!isMobile && <NavigationItems />}

//           {/* Right Section */}
//           <HStack spacing={2}>
//             <IconButton
//               aria-label="Toggle color mode"
//               icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
//               onClick={toggleColorMode}
//               variant="ghost"
//               size="sm"
//             />

//             <IconButton
//               aria-label="Notifications"
//               icon={<BellIcon />}
//               variant="ghost"
//               position="relative"
//               size="sm"
//             >
//               <Badge
//                 colorScheme="red"
//                 borderRadius="full"
//                 position="absolute"
//                 top="0"
//                 right="0"
//               >
//                 2
//               </Badge>
//             </IconButton>

//             <Menu>
//               <MenuButton>
//                 <Avatar
//                   size="sm"
//                   name={userData ? `${userData.firstName} ${userData.lastName}` : "User"}
//                   src={userData?.photoURL}
//                   cursor="pointer"
//                 />
//               </MenuButton>
//               <MenuList>
//                 <Box px={3} py={2}>
//                   <Heading size="sm">{userData ? `${userData.firstName} ${userData.lastName}` : "User"}</Heading>
//                   <Box fontSize="sm" color="gray.500">
//                     {userData?.email}
//                   </Box>
//                 </Box>
//                 <MenuDivider />
//                 <MenuItem as={Link} to="/profile">My Profile</MenuItem>
//                 <MenuItem as={Link} to="/settings">Settings</MenuItem>
//                 <MenuDivider />
//                 <MenuItem onClick={logout} icon={<FiLogOut />}>Logout</MenuItem>
//               </MenuList>
//             </Menu>
//           </HStack>
//         </Flex>
//       </Container>

//       {/* Mobile Navigation Drawer */}
//       <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
//         <DrawerOverlay />
//         <DrawerContent bg={navBg}>
//           <DrawerCloseButton />
//           <DrawerHeader borderBottomWidth="1px">
//             <HStack>
//               <Box
//                 bg="teal.500"
//                 color="white"
//                 p={2}
//                 rounded="md"
//                 fontWeight="bold"
//               >
//                 TS
//               </Box>
//               <Heading size="md" color={headingColor}>TeamSpace</Heading>
//             </HStack>
//           </DrawerHeader>
//           <DrawerBody pt={6}>
//             <VStack align="stretch" spacing={2}>
//               <NavigationItems direction="column" onItemClick={onClose} />

//               <Box pt={6} pb={2} px={3}>
//                 <Heading size="xs" textTransform="uppercase" color="gray.500">
//                   Workspaces
//                 </Heading>
//               </Box>

//               {userData?.joinedWorkspaces?.length > 0 ? (
//                 userData.joinedWorkspaces.map((workspace, index) => (
//                   <Button
//                     key={index}
//                     variant="ghost"
//                     justifyContent="flex-start"
//                     size="sm"
//                     onClick={onClose}
//                     as={Link}
//                     to={`/workspace/${workspace}`}
//                     py={5}
//                   >
//                     <Avatar size="xs" name={`Workspace ${index + 1}`} mr={3} />
//                     Workspace {index + 1}
//                   </Button>
//                 ))
//               ) : (
//                 <Box fontSize="sm" color="gray.500" pl={3}>
//                   No workspaces joined
//                 </Box>
//               )}
//             </VStack>
//           </DrawerBody>
//         </DrawerContent>
//       </Drawer>
//     </Box>
//   );
// };

// export default Header;
