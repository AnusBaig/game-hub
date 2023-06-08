import Icon from "@chakra-ui/icon";
import { Box } from "@chakra-ui/layout";
import { FaCheckCircle } from "react-icons/fa";

const FinishLoading = () => {
  return (
    <Box textAlign='center' my={5}>
      <Icon
        key='finishLoading'
        as={FaCheckCircle}
        color='green.400'
        width={12}
        height={12}
      />
    </Box>
  );
};

export default FinishLoading;
