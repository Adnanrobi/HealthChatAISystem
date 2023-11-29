export const getFileExtension = (url) => {
  if (typeof url === "string" && url.includes(".")) {
    return url.split(".").pop().toLowerCase();
  }
  return "";
};
