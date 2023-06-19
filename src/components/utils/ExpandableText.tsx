import { Button, Text } from "@chakra-ui/react";
import _ from "lodash";
import { useState } from "react";

interface Props {
  text: string;
}

const ExpandableText = ({ text }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 400;

  if (!text) return null;

  const handleTextExpand = () => {
    setExpanded(!expanded);
  };

  const formattedText = expanded ? text : _.truncate(text, { length: limit });

  return (
    <Text>
      {formattedText}
      {text.length > limit && (
        <Button
          size='xs'
          marginLeft={2}
          fontWeight='bold'
          colorScheme='yellow'
          onClick={handleTextExpand}
        >
          {expanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </Text>
  );
};

export default ExpandableText;
