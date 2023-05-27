import { HStack, Image, Text } from "@chakra-ui/react";
import React from "react";
import logo from "../../assets/logo.webp";

const Navbar = () => {
  return (
    <HStack padding='0.2rem'>
      <Image src={logo} width='50px' />
      <Text>NavBar</Text>
    </HStack>
  );
};

export default Navbar;
