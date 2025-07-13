import {
  Button,
  HStack,
  Input,
  Wrap,
  WrapItem,
  Tag,
  TagCloseButton,
  TagLabel,
} from "@chakra-ui/react";
import { useState } from "react";

interface FilterOption {
  name: string;
  slug: string;
}

interface MultiSelectFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  colorScheme?: string;
  allowCustomInput?: boolean;
  getDisplayName?: (slug: string) => string;
}

const MultiSelectFilter = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Add custom value",
  colorScheme = "blue",
  allowCustomInput = true,
  getDisplayName,
}: MultiSelectFilterProps) => {
  const [customInput, setCustomInput] = useState("");

  const handleToggleOption = (slug: string) => {
    if (selectedValues.includes(slug)) {
      onSelectionChange(selectedValues.filter(v => v !== slug));
    } else {
      onSelectionChange([...selectedValues, slug]);
    }
  };

  const handleAddCustom = () => {
    if (customInput && !selectedValues.includes(customInput)) {
      onSelectionChange([...selectedValues, customInput]);
    }
    setCustomInput("");
  };

  const handleRemove = (slug: string) => {
    onSelectionChange(selectedValues.filter(v => v !== slug));
  };

  const getDisplayText = (slug: string) => {
    return getDisplayName ? getDisplayName(slug) : slug;
  };

  return (
    <>
      {/* Predefined Options */}
      <Wrap mb={2}>
        {options.map(option => (
          <WrapItem key={option.slug}>
            <Button
              size="sm"
              variant={selectedValues.includes(option.slug) ? "solid" : "outline"}
              onClick={() => handleToggleOption(option.slug)}
            >
              {option.name}
            </Button>
          </WrapItem>
        ))}
      </Wrap>

      {/* Custom Input */}
      {allowCustomInput && (
        <HStack>
          <Input
            placeholder={placeholder}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCustom()}
          />
          <Button onClick={handleAddCustom} size="sm">
            Add
          </Button>
        </HStack>
      )}

      {/* Selected Values */}
      {selectedValues.length > 0 && (
        <Wrap mt={2}>
          {selectedValues.map(value => (
            <WrapItem key={value}>
              <Tag colorScheme={colorScheme}>
                <TagLabel>{getDisplayText(value)}</TagLabel>
                <TagCloseButton onClick={() => handleRemove(value)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </>
  );
};

export default MultiSelectFilter;