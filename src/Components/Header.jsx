import React from "react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import {
  Flex,
  Box,
  Heading,
  useColorMode,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.100", "gray.900");
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  return (
    <Box bg={bg} px={4} py={2} boxShadow={"md"}>
      <Flex align="center" justify="space-between" w="100%">
        <Heading color={headingColor}>Collaborate With Your Team</Heading>
        <IconButton onClick={toggleColorMode}>
          {colorMode == "light" ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      </Flex>
    </Box>
  );
};

export default Header;
