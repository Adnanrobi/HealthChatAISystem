/* eslint-disable no-useless-catch */
import { axiosInstance } from "./api";

export const login = async (email, password, isMedUser = false) => {
  const endpoint = isMedUser ? "/account/med-login/" : "/account/login/";
  try {
    const response = await axiosInstance.post(endpoint, {
      email,
      password,
    });
    if (response.status === 200) {
      return response.data.token;
    }
    throw new Error(response.data.msg || "Login failed");
  } catch (error) {
    throw error;
  }
};

export const register = async (formData) => {
  try {
    const response = await axiosInstance.post("/account/register/", formData);
    if (response.status === 200) {
      return response.data.msg;
    }
    throw new Error(response.data.msg || "Registration failed");
  } catch (error) {
    throw error;
  }
};
