import { Box, HStack, Image, Switch, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import logo from "../../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";
import SearchInput from "./SearchInput";

interface Props {
  onSearch: (seachText: string) => void;
}

const Navbar = ({ onSearch }: Props) => {
  return (
    <HStack padding={3} mb={[0, 5]} spacing={{ base: 2, lg: 100 }}>
      <Image src={logo} width={55} />
      <SearchInput onSearch={onSearch} />
      <ColorModeSwitch />
    </HStack>
  );
};

export default Navbar;
