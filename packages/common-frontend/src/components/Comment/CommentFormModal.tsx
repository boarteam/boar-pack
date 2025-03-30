import React from 'react';
import { Modal } from 'antd';
import CommentForm from "./CommentForm";

interface CommentFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (content: string) => void;
  children?: React.ReactNode;
  title?: string;
}

const CommentFormModal: React.FC<CommentFormProps> = ({ setIsOpen, isOpen, onSubmit, children, title = 'Add comment' }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      width={800}
      closeIcon={true}
      footer={null}
      onCancel={() => {
        setIsOpen(false);
      }}
    >
      {children}
      <CommentForm onSubmit={onSubmit} />
    </Modal>
  );
};

export default CommentFormModal;
