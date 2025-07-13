import FilterSection from "./common/FilterSection";
import RangeFilter from "./common/RangeFilter";

interface MetacriticFilterProps {
  value: [number, number];
  onChange: (value: number[]) => void;
}

const MetacriticFilter = ({ value, onChange }: MetacriticFilterProps) => {
  return (
    <FilterSection label="Metacritic Score Range">
      <RangeFilter
        value={value}
        onChange={onChange}
        min={0}
        max={100}
        step={5}
      />
    </FilterSection>
  );
};

export default MetacriticFilter;