import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import usePlatform from "../../hooks/usePlatform";
import usePlatforms from "../../hooks/usePlatforms";
import Platform from "../../models/platform";
import useGameQueryStore from "../../store";

const PlatformSelector = () => {
  const setPlatformId = useGameQueryStore((s) => s.setPlatformId);

  const platformId = useGameQueryStore((s) => s.gameQuery.platformId);
  const { data: selectedPlatform } = usePlatform(platformId);

  const { data, error } = usePlatforms();

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
            onClick={() => setPlatformId(platform.id)}
          >
            {platform.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PlatformSelector;
