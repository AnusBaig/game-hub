import { Box, Heading, Text } from "@chakra-ui/react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";

const ErrorPage = () => {
  const error = useRouteError();
  const isInvalidRoute = isRouteErrorResponse(error);

  return (
    <>
      <Navbar />
      <Box margin={5} textAlign='center'>
        <Heading fontSize='5xl' mb={4}>
          Oops
        </Heading>
        <Text fontSize='2xl'>
          {isInvalidRoute
            ? "This page doesnot exist"
            : "Sorry, an unexpected error has occurred."}
        </Text>
      </Box>
    </>
  );
};

export default ErrorPage;
