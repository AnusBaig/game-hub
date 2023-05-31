import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
const GameImageContainer = ({ children }: Props) => {
  return (
    <Box minHeight={250} height={280} maxHeight={400} objectFit='cover'>
      {children}
    </Box>
  );
};

export default GameImageContainer;
