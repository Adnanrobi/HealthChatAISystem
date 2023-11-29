import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImage,
  faFilePdf,
  faFileAlt,
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import {
  fetchFollowUps,
  archiveTicket,
  downloadFileWithAuth,
} from "../../api/api";
import FollowUpModal from "./modals/FollowUpModal";
import { CreateTicketModal } from "./modals/CreateTicketModal";
import "./ticketCard.css";
import { useAuth } from "../../hooks/useAuth";

function TicketCard({
  ticket,
  activeTab,
  userId,
  isFollowUp = false,
  isMedUser,
}) {
  const { token } = useAuth();
  console.log("TicketCard ticket.id:", ticket.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleArchive = async (ticketId) => {
    try {
      console.log(ticketId);
      const response = await archiveTicket(ticket.id, token);
    } catch (error) {
      console.error("Failed to archive ticket:", error);
      alert("Failed to archive. Please try again.");
    }
  };

  const getFileExtension = (url) => {
    if (typeof url === "string" && url.includes(".")) {
      return url.split(".").pop().toLowerCase();
    }
    return "";
  };

  const handleFileDownload = async (fileUuid, filename) => {
    try {
      const blob = await downloadFileWithAuth(fileUuid, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
      alert("Failed to download the file. Please try again.");
    }
  };

  return (
    <div className="ticket-card">
      <Card className="w-[340px] h-[340px] p-4">
        <CardHeader className="justify-between">
          <div>
            <h4 className="font-semibold leading-none text-xl text-default-600 h-[10px] text-center">
              Ticket # {ticket.id}
            </h4>
          </div>
          <div>
            {activeTab === "Processed" && !isFollowUp && (
              <FollowUpModal
                ticketId={ticket.id}
                fetchFollowUps={(ticketId) => fetchFollowUps(ticketId, token)}
                activeTab={activeTab}
                userId={userId}
              />
            )}
          </div>
        </CardHeader>
        <CardBody className="px-3 py-0 text-small text-default-400 h-[270px]">
          <div className="description-container">
            <p>{ticket.description}</p>
          </div>
          <div className="attachment-section">
            {ticket.files &&
              ticket.files.map((fileObj, index) => {
                const fileExtension = getFileExtension(fileObj.url);
                let icon;

                switch (fileExtension) {
                  case "jpg":
                  case "jpeg":
                  case "png":
                  case "gif":
                    icon = <FontAwesomeIcon icon={faFileImage} />;
                    break;
                  case "pdf":
                    icon = <FontAwesomeIcon icon={faFilePdf} />;
                    break;
                  case "txt":
                    icon = <FontAwesomeIcon icon={faFileText} />;
                    break;
                  default:
                    icon = <FontAwesomeIcon icon={faFileAlt} />;
                    break;
                }

                return (
                  <div key={index} className="attachment-item">
                    {icon}
                    <button
                      type="button"
                      onClick={() =>
                        handleFileDownload(fileObj.uuid, fileObj.filename)
                      }
                      className="download-link"
                    >
                      {fileObj.filename}
                    </button>
                  </div>
                );
              })}
          </div>
        </CardBody>
        <CardFooter className="card-footer-buttons">
          {isMedUser && activeTab === "Open" && !isFollowUp && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="footer-button primary-footer-button"
            >
              Add Follow-up
            </Button>
          )}
          {activeTab !== "Archived" && (
            <Button
              onClick={() => handleArchive(ticket.id)}
              className="footer-button secondary-footer-button"
            >
              Archive
            </Button>
          )}
        </CardFooter>
      </Card>
      <CreateTicketModal
        isOpen={isModalOpen}
        ticketId={ticket.id}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default TicketCard;
