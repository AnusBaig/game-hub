import { HStack, Heading, Text } from "@chakra-ui/react";
import moment from "moment";

interface Props {
  date: string;
}

const ReleaseDate = ({ date }: Props) => {
  const formattedDate = moment(date).format("MMMM YYYY");
  return (
    <HStack spacing={2} marginY={3}>
      <Text as='b'>Release</Text>
      <Text>{formattedDate}</Text>;
    </HStack>
  );
};

export default ReleaseDate;
