import { Heading } from "@chakra-ui/react";

interface Props {
  headingText?: string;
}

const SectionHeading = ({ headingText }: Props) => {
  if (!headingText) return null;
  return (
    <Heading as='h2' fontSize='4xl' mb={5}>
      {headingText}
    </Heading>
  );
};

export default SectionHeading;
