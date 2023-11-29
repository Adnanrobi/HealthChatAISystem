import React from "react";
import { Input } from "@nextui-org/react";
import { SearchIcon } from "../../images/svg/SearchIcon";

function SearchInput() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
        <Input
          type="search"
          placeholder="Type to search ..."
          labelPlacement="outside"
          startContent={
            <SearchIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
          }
        />
      </div>
    </div>
  );
}
export default SearchInput;
