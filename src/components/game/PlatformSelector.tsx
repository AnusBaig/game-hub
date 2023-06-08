import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import Platform from "../../models/platform";
import usePlatforms from "../../hooks/usePlatforms";
import usePlatform from "../../hooks/usePlatform";

interface Props {
  selectedPlatformId?: number;
  onSelectPlatform: (platform: Platform) => void;
}

const PlatformSelector = ({ selectedPlatformId, onSelectPlatform }: Props) => {
  const { data, error } = usePlatforms();
  const { data: selectedPlatform } = usePlatform(selectedPlatformId);

  if (error) {
    console.log(error);
    return null;
  }

  const isSelectedPlatform = (platform: Platform) =>
    selectedPlatform && platform.id == selectedPlatform.id;

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
