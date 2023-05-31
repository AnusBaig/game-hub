import { HStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const GenreItemContainer = ({ children }: Props) => {
  return <HStack justifyContent='flex-start'>{children}</HStack>;
};

export default GenreItemContainer;
