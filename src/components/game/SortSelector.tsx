import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import useGameQueryStore from "../../store";

const PlatformSelector = () => {
  const {
    gameQuery: { sortOrder },
    setSortOrder,
  } = useGameQueryStore();

  const isSelectedSort = (selectedOrder: string) =>
    sortOrder && selectedOrder == sortOrder;

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
        Order By: {getSelectedOrderLabel(sortOrder)}
      </MenuButton>
      <MenuList>
        {sortOrders?.map((order) => (
          <MenuItem
            key={order.value}
            fontWeight={isSelectedSort(order.value) ? "bold" : "normal"}
            bg={isSelectedSort(order.value) ? "gray.500" : ""}
            onClick={() => setSortOrder(order.value)}
          >
            {order.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PlatformSelector;
