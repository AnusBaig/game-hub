import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";

interface Props {
  selectedSortOrder?: string;
  onSelectSortOrder: (order: string) => void;
}

const PlatformSelector = ({ selectedSortOrder, onSelectSortOrder }: Props) => {
  const isSelectedSort = (sortOrder: string) =>
    selectedSortOrder && sortOrder == selectedSortOrder;

  const sortOrders = [
    { value: "", label: "Relevacne" },
    { value: "name", label: "Name" },
    { value: "-added", label: "Date Added" },
    { value: "-released", label: "Release Date" },
    { value: "-rating", label: "Average Rating" },
    { value: "-metacritic", label: "Popularity" },
  ];

  const getSelectedOrderLabel = (value?: string) => {
    let sortOrder = sortOrders.find((order) => order.value == value);

    return sortOrder?.label || "Relevance";
  };

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        Order By: {getSelectedOrderLabel(selectedSortOrder)}
      </MenuButton>
      <MenuList>
        {sortOrders?.map((order) => (
          <MenuItem
            key={order.value}
            fontWeight={isSelectedSort(order.value) ? "bold" : "normal"}
            bg={isSelectedSort(order.value) ? "gray.500" : ""}
            onClick={() => onSelectSortOrder(order.value)}
          >
            {order.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PlatformSelector;
