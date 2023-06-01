import { HStack, Show, Switch, Text, useColorMode } from "@chakra-ui/react";

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
      <Show above='sm'>
        <Text whiteSpace='nowrap'>
          {(isDarkTheme() ? "Dark" : "Light") + " theme"}
        </Text>
      </Show>
    </HStack>
  );
};

export default ColorModeSwitch;
