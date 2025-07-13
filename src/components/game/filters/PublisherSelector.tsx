import FilterSection from "./common/FilterSection";
import MultiSelectFilter from "./common/MultiSelectFilter";
import { GAME_PUBLISHERS, getPublisherName } from "../../../constants/gameFilters";

interface PublisherSelectorProps {
  selectedPublishers: string[];
  onChange: (publishers: string[]) => void;
}

const PublisherSelector = ({ selectedPublishers, onChange }: PublisherSelectorProps) => {
  return (
    <FilterSection label="Publishers">
      <MultiSelectFilter
        options={GAME_PUBLISHERS}
        selectedValues={selectedPublishers}
        onSelectionChange={onChange}
        placeholder="Add custom publisher slug (e.g. valve-software)"
        colorScheme="green"
        getDisplayName={getPublisherName}
      />
    </FilterSection>
  );
};

export default PublisherSelector;