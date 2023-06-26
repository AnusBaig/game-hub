import { BsGlobe } from "react-icons/bs";
import {
  FaAndroid,
  FaApple,
  FaLinux,
  FaPlaystation,
  FaWindows,
  FaXbox,
} from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md";
import { SiNintendo } from "react-icons/si";

import { HStack, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";
import Platform from "../../models/platformDetail";

interface Props {
  platforms: Platform[];
}

const PlatformIconList = ({ platforms }: Props) => {
  const iconMap: { [key: string]: IconType } = {
    pc: FaWindows,
    playstation: FaPlaystation,
    xbox: FaXbox,
    mac: FaApple,
    linux: FaLinux,
    nintendo: SiNintendo,
    android: FaAndroid,
    ios: MdPhoneIphone,
    web: BsGlobe,
  };

  return (
    <HStack spacing={4} marginX='auto'>
      {platforms &&
        platforms.map(
          ({ platform }, index) =>
            index < 6 && (
              <Icon
                key={platform.id}
                as={iconMap[platform.slug]}
                color='gray.500'
                width={6}
                height={6}
              />
            )
        )}
    </HStack>
  );
};

export default PlatformIconList;
