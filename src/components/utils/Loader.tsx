import { Box, Spinner } from "@chakra-ui/react";

const Loader = () => {
  return (
    <Box textAlign='center'>
      <Spinner my={5} size='xl' thickness='4px' color='red.500' />
    </Box>
  );
};

export default Loader;
