import { Heading } from "@chakra-ui/react";

interface Props {
  headingText?: string;
}

const TrailerHeading = ({ headingText }: Props) => {
  if (!headingText) return null;
  return (
    <Heading as='h4' fontSize='2xl' mb={3}>
      {headingText}
    </Heading>
  );
};

export default TrailerHeading;
