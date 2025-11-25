// src/components/DeleteConfirmationModal.tsx
import React from 'react';
import Modal from './Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  todoTitle: string; // To display which todo is being deleted
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  todoTitle,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete the todo: "<strong>{todoTitle}</strong>"?</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
