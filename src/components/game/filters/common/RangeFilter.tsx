import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  HStack,
  Text,
} from "@chakra-ui/react";

interface RangeFilterProps {
  value: [number, number];
  onChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const RangeFilter = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  label = "Range"
}: RangeFilterProps) => {
  return (
    <>
      <RangeSlider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
      <HStack justify="space-between" mt={2}>
        <Text fontSize="sm">
          Min: {value[0]}
        </Text>
        <Text fontSize="sm">
          Max: {value[1]}
        </Text>
      </HStack>
    </>
  );
};

export default RangeFilter;