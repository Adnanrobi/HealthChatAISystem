import React, { useState } from "react";
import { Button } from "@nextui-org/react"; // Import Button component
import "./navigationPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CreateTicketModal } from "../TicketComponents/modals/CreateTicketModal";
import { useAuth } from "../../hooks/useAuth";

function NavigationPanel({ currentTab, setCurrentTab }) {
  const handleNavigationClick = (tabName) => {
    setCurrentTab(tabName);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userData } = useAuth();

  return (
    <div className="pl-4 pr-4 bg-blue-200 navigation-panel">
      <ul>
        {!userData.is_med_user && (
          <li className="mb-[20px]">
            <div className="py-2 font-bold">
              <div>CHAT</div>
            </div>
            <ul className="sub-menu">
              <Button
                className="my-1 font-semibold text-gray-800 shadow-md bg-primary-300"
                onClick={() => handleNavigationClick("AI Chat")}
                onKeyDown={() => {}}
              >
                AI Chat
              </Button>
            </ul>
          </li>
        )}

        <li>
          <div className="flex items-center justify-between py-2">
            <div className="font-bold">TICKET</div>
            {!userData.is_med_user && (
              <div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="font-semibold text-gray-800 border-blue-500 hover:text-white bg-primary-100 hover:bg-primary-500"
                  variant="bordered"
                >
                  <FontAwesomeIcon icon={faPlus} /> New
                </Button>
              </div>
            )}
          </div>

          <ul className="my-2 sub-menu">
            <Button
              // className={`my-1 ${currentTab === "Open" ? "active" : ""}`}
              className="my-1 font-semibold text-gray-800 shadow-md bg-success-50 hover:bg-success-500"
              onClick={() => handleNavigationClick("Open")}
              onKeyDown={() => {}}
              variant="solid"
            >
              Open
            </Button>
            <Button
              // className={`my-1 ${currentTab === "Processed" ? "active" : ""}`}
              className="my-1 font-semibold text-gray-800 shadow-md bg-secondary-50 hover:bg-secondary-500 hover:text-white"
              onClick={() => handleNavigationClick("Processed")}
              onKeyDown={() => {}}
              variant="solid"
            >
              Processed
            </Button>
            <Button
              // className={`my-1 ${currentTab === "Archived" ? "active" : ""}`}
              className="my-1 font-semibold text-gray-800 shadow-md bg-warning-50 hover:bg-warning-500"
              onClick={() => handleNavigationClick("Archived")}
              onKeyDown={() => {}}
              variant="solid"
            >
              Archived
            </Button>
          </ul>
        </li>
      </ul>
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default NavigationPanel;
