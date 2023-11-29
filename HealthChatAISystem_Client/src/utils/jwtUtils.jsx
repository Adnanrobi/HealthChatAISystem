import jwtDecode from "jwt-decode";

export const decodeJWT = (token) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};
