import { FormControl, FormLabel, Divider, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface FilterSectionProps {
  label: string;
  children: ReactNode;
  showDivider?: boolean;
}

const FilterSection = ({ label, children, showDivider = true }: FilterSectionProps) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>{label}</FormLabel>
        {children}
      </FormControl>
      {showDivider && <Divider />}
    </VStack>
  );
};

export default FilterSection;