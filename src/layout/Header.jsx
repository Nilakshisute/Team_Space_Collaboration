import React from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  Container,
  Image,
  HStack,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiBell,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

const Header = ({ user, onLogout }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box 
      as="header" 
      borderBottom="1px" 
      borderColor={borderColor} 
      bg={bgColor} 
      position="sticky" 
      top="0" 
      zIndex="1000"
      boxShadow="sm"
    >
      <Container maxW="1200px">
        <Flex 
          minH="60px" 
          py={{ base: 2 }} 
          px={{ base: 4 }} 
          align="center"
          justify="space-between"
        >
          <Flex flex={{ base: 1 }} justify={{ base: "start" }}>
            <RouterLink to="/">
              <HStack spacing={2}>
                {/* Replace with your actual logo */}
                <Box 
                  bg="teal.500" 
                  color="white" 
                  fontWeight="bold" 
                  p={2} 
                  borderRadius="md"
                >
                  WS
                </Box>
                <Text 
                  fontWeight="bold" 
                  fontSize="xl" 
                  display={{ base: "none", md: "block" }}
                >
                  WorkspaceHub
                </Text>
              </HStack>
            </RouterLink>

            <Flex display={{ base: "none", md: "flex" }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify="flex-end"
            align="center"
            direction="row"
            spacing={3}
          >
            <IconButton
              icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle color mode"
            />
            
            <IconButton
              icon={<FiBell />}
              variant="ghost"
              aria-label="Notifications"
              position="relative"
            >
              {/* Optional: Notification Badge */}
              <Box
                position="absolute"
                top="0"
                right="0"
                bg="red.500"
                borderRadius="full"
                w="8px"
                h="8px"
              ></Box>
            </IconButton>

            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar 
                  size="sm" 
                  name={user?.firstName ? `${user.firstName} ${user.lastName}` : "User"} 
                  src={user?.photoURL} 
                  bg="teal.500"
                />
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />}>Profile</MenuItem>
                <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                <MenuItem icon={<FiHelpCircle />}>Help</MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiLogOut />} onClick={onLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>

          <Flex display={{ base: "flex", md: "none" }} ml={2}>
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <FiX /> : <FiMenu />}
              variant="ghost"
              aria-label="Toggle Navigation"
            />
          </Flex>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Container>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("teal.600", "teal.300");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");

  return (
    <Stack direction="row" spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Link
                p={2}
                as={RouterLink}
                to={navItem.href ?? "#"}
                fontSize="sm"
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: "none",
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={FiChevronDown}
                    w={3}
                    h={3}
                    ml={1}
                    display="inline"
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                bg={popoverContentBgColor}
                p={4}
                rounded="xl"
                minW="sm"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role="group"
      display="block"
      p={2}
      rounded="md"
      _hover={{ bg: useColorModeValue("teal.50", "gray.900") }}
    >
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            _groupHover={{ color: "teal.500" }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize="sm">{subLabel}</Text>
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon color="teal.500" w={5} h={5} as={FiChevronRight} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? "#"}
        justify="space-between"
        align="center"
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={FiChevronDown}
            transition="all .25s ease-in-out"
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle="solid"
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align="start"
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                py={2}
                as={RouterLink}
                to={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Workspaces",
    children: [
      {
        label: "My Workspaces",
        subLabel: "View your active workspaces",
        href: "/",
      },
      {
        label: "Create Workspace",
        subLabel: "Start a new collaborative space",
        href: "/create-workspace",
      },
    ],
  },
  {
    label: "Resources",
    children: [
      {
        label: "Documentation",
        subLabel: "Guides and reference materials",
        href: "#",
      },
      {
        label: "Templates",
        subLabel: "Ready-to-use workspace templates",
        href: "#",
      },
    ],
  },
];

export default Header;