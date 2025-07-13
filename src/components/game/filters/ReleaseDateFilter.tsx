import { HStack, Input, Text } from "@chakra-ui/react";
import FilterSection from "./common/FilterSection";

interface ReleaseDateFilterProps {
  value: [string, string];
  onChange: (field: "after" | "before", value: string) => void;
}

const ReleaseDateFilter = ({ value, onChange }: ReleaseDateFilterProps) => {
  const [afterDate, beforeDate] = value;

  return (
    <FilterSection label="Release Date Range">
      <HStack>
        <Input
          type="date"
          value={afterDate}
          onChange={(e) => onChange("after", e.target.value)}
          placeholder="From"
        />
        <Text>to</Text>
        <Input
          type="date"
          value={beforeDate}
          onChange={(e) => onChange("before", e.target.value)}
          placeholder="To"
        />
      </HStack>
    </FilterSection>
  );
};

export default ReleaseDateFilter;