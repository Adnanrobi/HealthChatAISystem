// Save the JWT token to localStorage
export const saveTokenToLocalStorage = (token) => {
  localStorage.setItem("token", token);
};

// Get the JWT token from localStorage
export const getTokenFromLocalStorage = () => localStorage.getItem("token");

// Remove the JWT token from localStorage
export const removeTokenFromLocalStorage = () => {
  localStorage.removeItem("token");
};

export const saveUserDataToLocalStorage = (decodedData) => {
  localStorage.setItem("user_id", decodedData.user_id);
  localStorage.setItem("is_med_user", decodedData.is_med_user);
};

export const getUserDataFromLocalStorage = () => ({
  user_id: localStorage.getItem("user_id"),
  is_med_user: localStorage.getItem("is_med_user") === "true",
});

export const removeUserDataFromLocalStorage = () => {
  localStorage.removeItem("user_id");
  localStorage.removeItem("is_med_user");
};
