import React, { useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
} from "@nextui-org/react";

import { createTicket, createFollowUp } from "../../../api/api";
import { useAuth } from "../../../hooks/useAuth";
import "./createTicketModal.css";

const MAX_COUNT = 5;
const MAX_SIZE = 4;

export function CreateTicketModal({ isOpen, onClose, save, ticketId }) {
  const { token } = useAuth();
  const fileInput = useRef();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [description, setDescription] = useState("");

  const resetModalState = () => {
    setUploadedFiles([]);
    setDescription("");
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleUploadFiles = (files) => {
    const uploaded = [...uploadedFiles];

    files.forEach((file) => {
      if (
        uploaded.length < MAX_COUNT &&
        file.size / (1024 * 1024) <= MAX_SIZE &&
        uploaded.findIndex((f) => f.name === file.name) === -1
      ) {
        uploaded.push(file);
      } else if (file.size / (1024 * 1024) > MAX_SIZE) {
        alert(`You can only add a file having max size of ${MAX_SIZE} MB`);
      } else if (uploaded.length >= MAX_COUNT) {
        alert(`You can only add a max of ${MAX_COUNT} files`);
      }
    });

    setUploadedFiles(uploaded);
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.from(e.target.files);
    handleUploadFiles(chosenFiles);
  };

  const renderFileList = () => (
    <ul className="text-sm uploaded-file-list">
      {uploadedFiles.map((file) => (
        <li key={file.name}>
          <span className="file-icon">📄</span>
          <div className="upload-file-name">{file.name}</div>
        </li>
      ))}
    </ul>
  );

  const handleSave = async () => {
    try {
      let response;
      const formData = new FormData();
      formData.append("description", description);
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (ticketId) {
        response = await createFollowUp(ticketId, formData, token);
      } else {
        response = await createTicket(formData, token);
      }

      const ticket = response.data;
      if (save) {
        save({
          ID: `#${ticket.id}`,
          Description: ticket.description,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("Failed to create ticket. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Create a new Ticket
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="mb-8">
              <label className="mx-2 my-8 font-semibold text-medium">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                labelPlacement="outside"
                placeholder="Describe the issue you are having"
                className="max-w-xl"
              />
            </div>
            <div className="file-upload-section">
              <Button
                onClick={() => fileInput.current.click()}
                color="secondary"
                className="font-semibold"
              >
                Upload Files
              </Button>
              <Input
                ref={fileInput}
                multiple
                onChange={handleFileEvent}
                type="file"
                accept="application/pdf, image/png"
                className="hidden"
              />
              <p className="mx-2 mt-4 text-sm italic file-limit-info opacity-70">
                Add a max of 5 files (each up to 4MB)
              </p>
            </div>
            <div>{renderFileList()}</div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={handleClose}
            className="font-semibold text-gray-800"
          >
            Close
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            className="font-semibold text-white"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateTicketModal;
