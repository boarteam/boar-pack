import dayjs from "dayjs";
import { createStyles } from "antd-style";
import CommentAvatar from "./CommentAvatar";

export interface AuthorProps {
  id: string;
  name: string;
}

interface CommentProps {
  key: string;
  content: string;
  author: AuthorProps;
  date: string;
}

const useStyles = createStyles(() => {
  return {
    /**
     * Styles for the ant-descriptions component to show edit icon on hover
     */
    commentStyles: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    }
  }
})

const Comment: React.FC<CommentProps> = ({
  content,
  author,
  date,
  ...rest
}) => {
  const { styles } = useStyles();

  return (
    <div
      className={styles.commentStyles}
      {...rest}
    >
      <CommentAvatar author={author} />
      <div>
        <strong>{author.name}</strong>
        <p>{content}</p>
        <small style={{ color: '#888' }}>{dayjs(date).format('DD.MM.YYYY HH:mm')}</small>
      </div>
    </div>
  );
};

export default Comment;
