import React, { useMemo } from "react";
import { Input } from "@nextui-org/react";

export default function EmailInput({ input, handleInputChange }) {
  const validateEmail = (emailInput) =>
    emailInput.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

  const isInvalid = useMemo(() => {
    if (input === "") return false;
    return !validateEmail(input);
  }, [input]);

  return (
    <Input
      isClearable
      value={input}
      type="email"
      label="Email"
      variant="bordered"
      isInvalid={isInvalid}
      color={isInvalid ? "danger" : "success"}
      errorMessage={isInvalid && "Please enter a valid email"}
      onValueChange={(value) => handleInputChange(value, "email")}
      className="max-w-xs"
    />
  );
}
