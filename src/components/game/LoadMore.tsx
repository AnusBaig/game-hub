import { Button } from "@chakra-ui/button";
import { Box, Spinner } from "@chakra-ui/react";

interface Props {
  isLoading?: boolean;
  onClick: () => void;
}

const LoadMore = ({ isLoading, onClick }: Props) => {
  return (
    <Box textAlign='center'>
      {isLoading ? (
        <Spinner my={5} size='xl' thickness='4px' color='red.500' />
      ) : (
        <Button my={5} textAlign='center' onClick={onClick}>
          Load More
        </Button>
      )}
    </Box>
  );
};

export default LoadMore;
