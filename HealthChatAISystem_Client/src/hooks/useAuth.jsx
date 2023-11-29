import { useState, useEffect } from "react";
import {
  saveTokenToLocalStorage,
  getTokenFromLocalStorage,
  removeTokenFromLocalStorage,
  saveUserDataToLocalStorage,
  getUserDataFromLocalStorage,
  removeUserDataFromLocalStorage,
} from "../utils/authUtils";
import { decodeJWT } from "../utils/jwtUtils";

export const useAuth = () => {
  const [token, setToken] = useState(getTokenFromLocalStorage());
  const [userData, setUserData] = useState(getUserDataFromLocalStorage());

  const login = (newToken) => {
    setToken(newToken);
    saveTokenToLocalStorage(newToken);
    const decodedData = decodeJWT(newToken);
    setUserData(decodedData);
    saveUserDataToLocalStorage(decodedData);
  };

  const logout = () => {
    setToken(null);
    setUserData(null);
    removeTokenFromLocalStorage();
    removeUserDataFromLocalStorage();
  };

  useEffect(() => {
    const storedToken = getTokenFromLocalStorage();
    const storedUserData = getUserDataFromLocalStorage();
    if (storedToken) {
      setToken(storedToken);
      setUserData(storedUserData);
    }
  }, []);

  return { token, login, logout, userData };
};
