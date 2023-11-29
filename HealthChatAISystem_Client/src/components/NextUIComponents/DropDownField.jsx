import React from "react";
import { Select, SelectItem } from "@nextui-org/react";

export default function DropDownField() {
  return (
    <Select className="max-w-xs" label="Select Gender">
      <SelectItem key="Male">Male</SelectItem>
      <SelectItem key="Female">Female</SelectItem>
      <SelectItem key="Other">Other</SelectItem>
    </Select>
  );
}
