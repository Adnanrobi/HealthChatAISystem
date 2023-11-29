import React, { useRef, useState, useEffect } from "react";
import "./aiChat.css";
import { Card, CardBody, Button, Skeleton } from "@nextui-org/react";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { SendIcon } from "../NextUIComponents/SendIcon";
import TextAreaComponent from "../NextUIComponents/TextAreaComponent";
import AvatarComponent from "../NextUIComponents/Avatar";
import userAvatar from "../../images/userAvatar.png";
import assistantAvatar from "../../images/assistantAvatar.png";
import { useAuth } from "../../hooks/useAuth";
import {
  postUserMessage,
  fetchMessagesWithPagination,
  fetchTotalMessageCount,
} from "../../api/api";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AiChat() {
  const { token } = useAuth();
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const scrollHeightBeforeAppend = useRef(null);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleScroll = debounce(async (scrollTop) => {
    if (scrollTop > 10 || allMessagesLoaded || isLoading) {
      return;
    }

    // Add this condition
    if (currentPage === 1) {
      setAllMessagesLoaded(true);
      return;
    }

    scrollHeightBeforeAppend.current =
      messagesContainerRef.current.scrollHeight;

    setIsLoading(true);
    const prevPage = currentPage - 1;

    const response = await fetchMessagesWithPagination(prevPage, token);

    setIsLoading(false);

    if (response && response.results) {
      setChatMessages((prevMessages) => [...response.results, ...prevMessages]);
      setCurrentPage(prevPage);
      if (response.previous === null) {
        setAllMessagesLoaded(true);
      }
    }

    const currentScrollHeight = messagesContainerRef.current.scrollHeight;
    const heightDifference =
      currentScrollHeight - scrollHeightBeforeAppend.current;
    messagesContainerRef.current.scrollTop += heightDifference;
  }, 300);

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return; // Prevent sending empty messages

    const tempMessage = {
      id: Date.now(), // temporary id
      user_input: inputText,
      chatgpt_input: null,
      user_id: "1",
    };

    setInputText("");

    setChatMessages((prevMessages) => [...prevMessages, tempMessage]);
    // Set awaitingResponse to true before making API call
    setAwaitingResponse(true);

    const responseData = await postUserMessage(inputText, "1", token);

    // Set awaitingResponse back to false after receiving the response
    setAwaitingResponse(false);

    if (responseData) {
      setChatMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempMessage.id ? responseData.data : msg,
        ),
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        if (inputText.trim() !== "") {
          handleSendMessage();
        }
      }
    }
  };

  useEffect(() => {
    const fetchInitialMessages = async () => {
      setIsLoading(true);
      try {
        const totalMessageCount = await fetchTotalMessageCount(token);
        if (totalMessageCount === 0) {
          setIsLoading(false);
          return;
        }
        const itemsPerPage = 5;
        const lastPage = Math.ceil(totalMessageCount / itemsPerPage);

        const lastPageResponse = await fetchMessagesWithPagination(
          lastPage,
          token,
        );
        let allMessages = lastPageResponse.results || [];

        if (lastPage > 1) {
          const secondLastPageResponse = await fetchMessagesWithPagination(
            lastPage - 1,
            token,
          );
          allMessages = [...secondLastPageResponse.results, ...allMessages];
          setCurrentPage(lastPage - 1);
        } else {
          setCurrentPage(lastPage);
        }

        setChatMessages(allMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMessages();
  }, [token]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="chat-page">
      <div className="chat-container hero-pattern-bg">
        <div
          className="messages"
          ref={messagesContainerRef}
          onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
        >
          {chatMessages.map((message) => (
            <div key={message.id}>
              <div className="message user">
                <div className="avatar-right">
                  {/* <AvatarComponent image={userAvatar} /> */}
                  <AvatarComponent />
                </div>
                <Card className="max-w-[80%] shadow-xl">
                  <CardBody>{message.user_input}</CardBody>
                </Card>
              </div>

              <div className="message assistant">
                <div className="avatar-left">
                  <AvatarComponent image={assistantAvatar} />
                </div>
                <Card className="max-w-[80%]">
                  <CardBody>{message.chatgpt_input || <Loader />}</CardBody>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-md input-container chat-input">
          <TextAreaComponent
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={awaitingResponse}
          />

          <Button
            isIconOnly
            color="primary"
            variant="flat"
            aria-label="Send"
            onClick={handleSendMessage}
            disabled={awaitingResponse}
            size="lg"
            className="w-16 h-16 mt-2 p-9"
          >
            <FontAwesomeIcon icon={faPaperPlane} size="xl" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AiChat;
