import FilterSection from "./common/FilterSection";
import MultiSelectFilter from "./common/MultiSelectFilter";
import { GAME_DEVELOPERS, getDeveloperName } from "../../../constants/gameFilters";

interface DeveloperSelectorProps {
  selectedDevelopers: string[];
  onChange: (developers: string[]) => void;
}

const DeveloperSelector = ({ selectedDevelopers, onChange }: DeveloperSelectorProps) => {
  return (
    <FilterSection label="Developers" showDivider={false}>
      <MultiSelectFilter
        options={GAME_DEVELOPERS}
        selectedValues={selectedDevelopers}
        onSelectionChange={onChange}
        placeholder="Add custom developer slug (e.g. cd-projekt-red)"
        colorScheme="purple"
        getDisplayName={getDeveloperName}
      />
    </FilterSection>
  );
};

export default DeveloperSelector;