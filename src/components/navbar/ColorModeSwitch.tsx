import { HStack, Switch, Text, useColorMode } from "@chakra-ui/react";

const ColorModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const isDarkTheme = () => colorMode === "dark";
  return (
    <HStack>
      <Switch
        isChecked={isDarkTheme()}
        size='md'
        colorScheme='teal'
        onChange={toggleColorMode}
      />
      <Text>{(isDarkTheme() ? "Dark" : "Light") + " theme"}</Text>
    </HStack>
  );
};

export default ColorModeSwitch;
