import { Button } from "@chakra-ui/button";
import { Box, Spinner } from "@chakra-ui/react";
import Loader from "../Loader";

interface Props {
  isLoading?: boolean;
  onClick: () => void;
}

const LoadMore = ({ isLoading, onClick }: Props) => {
  return (
    <Box textAlign='center'>
      {isLoading ? (
        <Loader />
      ) : (
        <Button my={5} textAlign='center' onClick={onClick}>
          Load More
        </Button>
      )}
    </Box>
  );
};

export default LoadMore;
