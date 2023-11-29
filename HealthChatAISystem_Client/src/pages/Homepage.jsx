import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationPanel from "../components/NavigationComponent/NavigationPanel";
import TicketList from "../components/TicketComponents/TicketList";
import AiChat from "../components/ChattingComponents/AiChat";
import Nav from "../components/nav/Nav";
import { useAuth } from "../hooks/useAuth";
import "./homePage.css";

function HomePage() {
  const [currentTab, setCurrentTab] = useState("AI Chat");
  // eslint-disable-next-line no-unused-vars
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="home-page">
      <Nav className="nav" onLogout={handleLogout} />
      <div className="main-content">
        <NavigationPanel
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openCreateTicketModal={() => setIsModalOpen(true)}
        />
        <div className="content">
          {currentTab === "AI Chat" && !userData.is_med_user && <AiChat />}
          {currentTab === "Open" && (
            <TicketList activeTab="Open" openCreateTicketModal={openModal} />
          )}
          {currentTab === "Processed" && (
            <TicketList
              activeTab="Processed"
              openCreateTicketModal={openModal}
            />
          )}
          {currentTab === "Archived" && (
            <TicketList
              activeTab="Archived"
              openCreateTicketModal={openModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
