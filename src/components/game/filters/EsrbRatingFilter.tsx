import { Select } from "@chakra-ui/react";
import FilterSection from "./common/FilterSection";
import { ESRB_RATINGS } from "../../../constants/gameFilters";

interface EsrbRatingFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const EsrbRatingFilter = ({ value, onChange }: EsrbRatingFilterProps) => {
  return (
    <FilterSection label="ESRB Rating">
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {ESRB_RATINGS.map(rating => (
          <option key={rating.value} value={rating.value}>
            {rating.label}
          </option>
        ))}
      </Select>
    </FilterSection>
  );
};

export default EsrbRatingFilter;