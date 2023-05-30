import { Box, HStack, Image, Switch, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import logo from "../../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";

const Navbar = () => {
  return (
    <HStack padding={3} justifyContent='space-between'>
      <Image src={logo} width={55} />
      <Text>Game Hub</Text>
      <ColorModeSwitch />
    </HStack>
  );
};

export default Navbar;
