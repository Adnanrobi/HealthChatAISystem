import React, { useState, useEffect } from "react";
import "./TicketList.css";
import TicketCard from "./TicketCard";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchRegularUserOpenTickets,
  fetchMedUserOpenTickets,
  fetchProcessedTicketsByMedUser,
} from "../../api/api";

function TicketList({ activeTab, openCreateTicketModal }) {
  const [tickets, setTickets] = useState([]);
  const { token, userData } = useAuth();

  const filterTickets = (data) => {
    switch (activeTab) {
      case "Open":
        return data.filter((ticket) => ticket.is_open);
      case "Processed":
        if (userData.is_med_user) {
          return data.filter(
            (ticket) => ticket.opened_by_med_id === userData.user_id,
          );
        }
        return data.filter((ticket) => !ticket.is_open);

      case "Archived":
        return data.filter((ticket) => ticket.is_archived);
      default:
        return data;
    }
  };

  const fetchTicketData = async () => {
    try {
      let fetchedTickets;
      if (userData.is_med_user) {
        if (activeTab === "Open") {
          fetchedTickets = await fetchMedUserOpenTickets(token);
        } else if (activeTab === "Processed") {
          fetchedTickets = await fetchProcessedTicketsByMedUser(token);
        }
      } else {
        fetchedTickets = await fetchRegularUserOpenTickets(token);
      }

      const filteredTickets = filterTickets(fetchedTickets);
      setTickets(filteredTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [activeTab]);

  return (
    <div className="h-full tickets-display hero-pattern-bg">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          activeTab={activeTab}
          userId={userData.user_id}
          isMedUser={userData.is_med_user}
          openCreateTicketModal={openCreateTicketModal}
        />
      ))}
    </div>
  );
}

export default TicketList;
