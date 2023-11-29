import React from "react";
import { Textarea } from "@nextui-org/react";

function TextAreaComponent({ value, onChange, disabled }) {
  return (
    <Textarea
      maxRows={3}
      placeholder="Type a message..."
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
export default TextAreaComponent;
