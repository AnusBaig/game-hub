import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import useData from "../../hooks/useData";
import { Endpoints } from "../../constants/endpoints";
import Platform from "../../models/platform";

interface Props {
  selectedPlatform?: Platform;
  onSelectPlatform: (platform: Platform) => void;
}

const PlatformSelector = ({ selectedPlatform, onSelectPlatform }: Props) => {
  const { data, isLoading, error } = useData<Platform>(
    Endpoints.FETCH_PARENT_PLATFORMS
  );

  const isSelectedPlatform = (platform: Platform) =>
    selectedPlatform && platform.slug == selectedPlatform.slug;

  if (error) return null;

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
