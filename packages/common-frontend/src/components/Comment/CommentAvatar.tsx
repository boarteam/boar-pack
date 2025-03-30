import { Avatar } from "antd";
import { AuthorProps } from "./Comment";
import React from "react";

interface CommentProps {
  author: AuthorProps;
}

const ColorList = [
  '#f56a00',
  '#7265e6',
  '#ffbf00',
  '#00a2ae',
  '#b45d7e',
  '#ace665',
  '#6e3aaf',
  '#54ae00'
];

const getColorByAuthor = (authorId: string) => {
  return ColorList[parseInt(authorId, 36) % ColorList.length]
}

const CommentAvatar: React.FC<CommentProps> = ({
  author,
}) => {
  return (
    <Avatar style={{ backgroundColor: getColorByAuthor(author.id), verticalAlign: 'middle', flexShrink: 0 }} size="large">
      {author.name.slice(0, 1)}
    </Avatar>
  );
};

export default CommentAvatar;
