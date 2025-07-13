import FilterSection from "./common/FilterSection";
import MultiSelectFilter from "./common/MultiSelectFilter";
import { GAME_TAGS, getTagName } from "../../../constants/gameFilters";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TagSelector = ({ selectedTags, onChange }: TagSelectorProps) => {
  return (
    <FilterSection label="Tags">
      <MultiSelectFilter
        options={GAME_TAGS}
        selectedValues={selectedTags}
        onSelectionChange={onChange}
        placeholder="Add custom tag ID (e.g. 31 for singleplayer)"
        colorScheme="blue"
        getDisplayName={getTagName}
      />
    </FilterSection>
  );
};

export default TagSelector;