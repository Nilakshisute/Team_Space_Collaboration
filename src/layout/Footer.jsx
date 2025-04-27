// import React from "react";
// import {
//   Box,
//   Container,
//   Stack,
//   SimpleGrid,
//   Text,
//   Link,
//   VisuallyHidden,
//   chakra,
//   useColorModeValue,
//   Flex,
//   HStack,
//   Icon,
// } from "@chakra-ui/react";
// import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";
// import { Link as RouterLink } from "react-router-dom";

// const ListHeader = ({ children }) => {
//   return (
//     <Text fontWeight="500" fontSize="lg" mb={2}>
//       {children}
//     </Text>
//   );
// };

// const SocialButton = ({ children, label, href }) => {
//   return (
//     <chakra.button
//       bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
//       rounded="full"
//       w={8}
//       h={8}
//       cursor="pointer"
//       as="a"
//       href={href}
//       display="inline-flex"
//       alignItems="center"
//       justifyContent="center"
//       transition="background 0.3s ease"
//       _hover={{
//         bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
//       }}
//       target="_blank"
//       rel="noopener noreferrer"
//     >
//       <VisuallyHidden>{label}</VisuallyHidden>
//       {children}
//     </chakra.button>
//   );
// };

// const Footer = () => {
//   const borderColor = useColorModeValue("gray.200", "gray.700");
//   const bgColor = useColorModeValue("gray.50", "gray.900");
//   const textColor = useColorModeValue("gray.700", "gray.200");

//   return (
//     <Box
//       as="footer"
//       bg={bgColor}
//       color={textColor}
//       borderTop="1px"
//       borderColor={borderColor}
//       mt="auto"
//     >
//       <Container as={Stack} maxW="1200px" py={8}>
//         <SimpleGrid
//           templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" }}
//           spacing={8}
//         >
//           <Stack spacing={6}>
//             <Flex align="center">
//               <Box
//                 bg="teal.500"
//                 color="white"
//                 fontWeight="bold"
//                 p={2}
//                 borderRadius="md"
//               >
//                 WS
//               </Box>
//               <Text ml={2} fontWeight="bold" fontSize="xl">
//                 WorkspaceHub
//               </Text>
//             </Flex>
//             <Text fontSize="sm">
//               © {new Date().getFullYear()} WorkspaceHub. All rights reserved.
//             </Text>
//             <Stack direction="row" spacing={4}>
//               <SocialButton label="Twitter" href="#">
//                 <FiTwitter />
//               </SocialButton>
//               <SocialButton label="GitHub" href="#">
//                 <FiGithub />
//               </SocialButton>
//               <SocialButton label="LinkedIn" href="#">
//                 <FiLinkedin />
//               </SocialButton>
//               <SocialButton label="Email" href="mailto:info@workspacehub.com">
//                 <FiMail />
//               </SocialButton>
//             </Stack>
//           </Stack>
//           <Stack align="flex-start">
//             <ListHeader>Product</ListHeader>
//             <Link as={RouterLink} to="/">Features</Link>
//             <Link as={RouterLink} to="/">Pricing</Link>
//             <Link as={RouterLink} to="/">Templates</Link>
//             <Link as={RouterLink} to="/">Integrations</Link>
//           </Stack>
//           <Stack align="flex-start">
//             <ListHeader>Company</ListHeader>
//             <Link as={RouterLink} to="/">About</Link>
//             <Link as={RouterLink} to="/">Careers</Link>
//             <Link as={RouterLink} to="/">Contact Us</Link>
//             <Link as={RouterLink} to="/">Partners</Link>
//           </Stack>
//           <Stack align="flex-start">
//             <ListHeader>Support</ListHeader>
//             <Link as={RouterLink} to="/">Help Center</Link>
//             <Link as={RouterLink} to="/">Terms of Service</Link>
//             <Link as={RouterLink} to="/">Privacy Policy</Link>
//             <Link as={RouterLink} to="/">Status</Link>
//           </Stack>
//         </SimpleGrid>
//       </Container>
//     </Box>
//   );
// };

// export default Footer;
