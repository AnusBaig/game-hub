import { HStack, Image } from "@chakra-ui/react";
import logo from "../../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";
import SearchInput from "./SearchInput";

const Navbar = () => {
  return (
    <HStack padding={3} mb={[0, 5]} spacing={{ base: 2, lg: 100 }}>
      <Image src={logo} width={55} />
      <SearchInput />
      <ColorModeSwitch />
    </HStack>
  );
};

export default Navbar;
