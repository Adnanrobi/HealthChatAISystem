import { Avatar, AvatarIcon } from "@nextui-org/react";
import React from "react";

function AvatarComponent({ image }) {
  const isNotDefault = Boolean(image);
  return (
    <Avatar
      src={image}
      icon={isNotDefault ? "" : <AvatarIcon />}
      className={isNotDefault ? "" : "bg-blue-100 text-gray-600"}
    />
  );
}

export default AvatarComponent;
