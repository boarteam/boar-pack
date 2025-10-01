import { List, Tag } from "antd";
import { TServerErrorItem } from "./ChangesModal";

const formatField = (field: string) => {
  const parts = field.split(".");
  if (parts[0] === "new" && parts.length >= 3) {
    const idx = Number(parts[1]);
    return `New #${isNaN(idx) ? parts[1] : idx + 1}: ${parts.slice(2).join(".")}`;
  }
  if (parts[0] === "updated" && parts.length >= 3) {
    const id = parts[1];
    return `Updated ${id}: ${parts.slice(2).join(".")}`;
  }
  return field;
};

const ErrorsTab = ({
                     serverErrors,
                   }: {
  serverErrors: TServerErrorItem[],
}) => {
  if (serverErrors.length === 0) {
    return <div>No errors</div>;
  }

  return (
    [
      <p key='errors-header'>Please fix the following errors and repeat import</p>,
      <List
        key='errors-list'
        size="small"
        dataSource={serverErrors}
        renderItem={(err, idx) => (
          <List.Item key={idx}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
              {err.field && <div>
                <Tag color="error">{formatField(err.field)}</Tag>
              </div>}
              <div>{err.message}</div>
              {err.field && <div style={{ color: "#999" }}>({err.field})</div>}
            </div>
          </List.Item>
        )}
      />,
    ]
  );
};

export default ErrorsTab;
