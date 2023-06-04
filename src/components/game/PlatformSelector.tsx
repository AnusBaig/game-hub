import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import Platform from "../../models/platform";
import usePlatforms from "../../hooks/usePlatforms";

interface Props {
  selectedPlatform?: Platform;
  onSelectPlatform: (platform: Platform) => void;
}

const PlatformSelector = ({ selectedPlatform, onSelectPlatform }: Props) => {
  const { data, error } = usePlatforms();

  if (error) {
    console.log(error);
    return null;
  }

  const isSelectedPlatform = (platform: Platform) =>
    selectedPlatform && platform.slug == selectedPlatform.slug;

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        {selectedPlatform?.name || "Platforms"}
      </MenuButton>
      <MenuList>
        {data?.map((platform) => (
          <MenuItem
            key={platform.id}
            fontWeight={isSelectedPlatform(platform) ? "bold" : "normal"}
            bg={isSelectedPlatform(platform) ? "gray.500" : ""}
            onClick={() => onSelectPlatform(platform)}
          >
            {platform.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PlatformSelector;
