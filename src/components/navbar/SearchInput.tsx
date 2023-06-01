import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";

const SearchInput = () => {
  return (
    <InputGroup boxShadow='2xl'>
      <InputLeftElement children={<BsSearch />} />
      <Input placeholder='Search Games...' borderRadius={20} />
    </InputGroup>
  );
};

export default SearchInput;
