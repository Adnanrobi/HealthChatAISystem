import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { fetchFollowUps } from "../../../api/api";
import TicketCard from "../TicketCard";
import { useAuth } from "../../../hooks/useAuth";
import { CreateTicketModal } from "./CreateTicketModal";
import "./FollowUpModal.css";

export default function FollowUpModal({ ticketId, activeTab }) {
  const [followUps, setFollowUps] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { token, userData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = async () => {
    try {
      const response = await fetchFollowUps(ticketId, token);
      setFollowUps(response.data.results.followup_data);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    }
    onOpen();
  };

  // Determine if current user is the creator or a medical user who responded
  const isRegularUserCreator = followUps.creator_id === userData.id;
  const isMedUserResponder = followUps.opened_by_med_id === userData.id;

  return (
    <>
      <Button onPress={handleOpen}>Show Follow-ups</Button>

      <Modal size="5xl" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Follow-ups for Ticket {ticketId}
              </ModalHeader>
              <ModalBody className="followup-tickets-display">
                {followUps.length > 0 ? (
                  followUps.map((followUp) => (
                    <div key={followUp.id}>
                      <TicketCard
                        ticket={followUp}
                        activeTab={activeTab}
                        userId={userData.id}
                        token={token}
                        isFollowUp
                      />
                    </div>
                  ))
                ) : (
                  <p>No follow-up tickets available.</p>
                )}
              </ModalBody>
              <ModalFooter>
                {(isRegularUserCreator || isMedUserResponder) && (
                  <Button onClick={() => setIsModalOpen(true)}>
                    Add Follow-up
                  </Button>
                )}
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <CreateTicketModal
        isOpen={isModalOpen}
        ticketId={ticketId}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
