import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { BsSearch } from "react-icons/bs";

interface Props {
  onSearch: (seachText: string) => void;
}

const SearchInput = ({ onSearch }: Props) => {
  const { register, handleSubmit } = useForm({
    mode: "all",
  });

  const inputName = "searchInput";
  return (
    <form
      onSubmit={handleSubmit((data) => onSearch(data[inputName]))}
      className='w-100'
    >
      <InputGroup boxShadow='2xl'>
        <InputLeftElement children={<BsSearch />} />
        <Input
          placeholder='Search Games...'
          borderRadius={20}
          variant='filled'
          {...register(inputName)}
        />
      </InputGroup>
    </form>
  );
};

export default SearchInput;
