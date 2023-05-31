import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
const GenrePicContainer = ({ children }: Props) => {
  return (
    <Box boxSize={10} borderRadius={8}>
      {children}
    </Box>
  );
};

export default GenrePicContainer;
