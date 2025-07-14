import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <div>
        <Form.Item label="Leave a comment:">
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" style={{ width: 100 }}>
        Send
      </Button>
    </Form>
  );
};

export default CommentForm;
