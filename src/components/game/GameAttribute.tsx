import { Box, Text } from "@chakra-ui/react";
import CriticScore from "./CriticScore";

interface Props {
  heading: string;
  dataList: (string | number)[];
  showBadge?: boolean;
}

const GameAttribute = ({ heading, dataList, showBadge }: Props) => {
  return (
    <Box fontSize={17}>
      <Text fontWeight='bold' color='gray.500'>
        {heading}
      </Text>
      {dataList &&
        dataList.map((text, index) =>
          showBadge ? (
            <CriticScore key={index} score={Number(text)} />
          ) : (
            <Text key={index} marginBottom={2}>
              {text}
            </Text>
          )
        )}
    </Box>
  );
};

export default GameAttribute;
