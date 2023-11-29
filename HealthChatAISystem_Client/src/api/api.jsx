import axios from "axios";
import { getFileExtension } from "../utils/generalUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const getWithAuth = (url, token) =>
  axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const postWithAuth = (url, data, token, isMultipart = false) => {
  const headers = isMultipart
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    : {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
  return axiosInstance.post(url, data, {
    headers,
  });
};

export const createTicket = (formData, token) =>
  postWithAuth(`/ticket/create/`, formData, token, true);

export const fetchMessagesWithPagination = async (currentPage, token) => {
  const pageQuery = currentPage !== null ? `page=${currentPage}&` : "";
  const response = await getWithAuth(
    `/texts/user/?${pageQuery}perpage=5`,
    token,
  );
  return response.data;
};

export const fetchMessagesFromUrl = async (url, token) => {
  const strippedUrl = url !== "" ? url.split("/api")[1] : "/texts/user/";
  const response = await getWithAuth(strippedUrl, token);
  return response.data;
};

export const fetchTotalMessageCount = async (token) => {
  try {
    const response = await getWithAuth(`/texts/user/?perpage=1`, token);
    return response.data.count;
  } catch (err) {
    console.error("Failed to fetch total message count:", err);
    return null;
  }
};

export const postUserMessage = (inputText, userId, token) => {
  const data = { user_input: inputText, chatgpt_input: null, user_id: userId };
  return postWithAuth("/texts/create/", data, token);
};

export const fetchRegularUserOpenTickets = async (token) => {
  const response = await getWithAuth(`/ticket/reg-user-list/`, token);
  return response.data.results;
};

export const fetchMedUserOpenTickets = async (token) => {
  const response = await getWithAuth(`/ticket/med-user-open-list/`, token);
  return response.data.results;
};

export const createFollowUp = async (ticketId, formData, token) => {
  const url = `/ticket/${ticketId}/followup/create/`;
  return postWithAuth(url, formData, token, true);
};

export const archiveTicket = (ticketId, token) =>
  // Here the data is empty as there's no need to send data to archive a ticket.
  postWithAuth(`/ticket/${ticketId}/archive/`, {}, token);

export const fetchFollowUps = async (ticketId, token) =>
  getWithAuth(`/ticket/${ticketId}/followup-list/`, token);

export const fetchProcessedTicketsByMedUser = async (token) => {
  const response = await getWithAuth(`/ticket/med-user-close-list/`, token);
  return response.data.results;
};

export const downloadFileWithAuth = async (uuid, token) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/ticket/download/${uuid}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

export const downloadFile = async (fileObj, token) => {
  const response = await axiosInstance.get(`/ticket/download/${fileObj.uuid}`, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });

  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const link = document.createElement("a");
  const fileExtension = getFileExtension(fileObj.url);

  link.href = URL.createObjectURL(blob);
  link.download = `file_${fileObj.uuid}.${fileExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
