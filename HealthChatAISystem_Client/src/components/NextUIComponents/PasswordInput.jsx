import React from "react";
import { Input } from "@nextui-org/react";
import { EyeSlashFilledIcon } from "../../images/svg/EyeSlashFilledIcon";
import { EyeFilledIcon } from "../../images/svg/EyeFilledIcon";

export default function PasswordInput({
  password,
  handleInputChange,
  fieldName,
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Input
      value={password}
      label={fieldName === "password" ? "Password" : "Confirm Password"}
      variant="bordered"
      endContent={
        <button
          className="focus:outline-none"
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeSlashFilledIcon className="text-2xl pointer-events-none text-default-400" />
          ) : (
            <EyeFilledIcon className="text-2xl pointer-events-none text-default-400" />
          )}
        </button>
      }
      type={isVisible ? "text" : "password"}
      onValueChange={(value) =>
        handleInputChange(
          value,
          fieldName === "password" ? "password" : "confirmPassword",
        )
      }
      className="max-w-xs"
    />
  );
}
