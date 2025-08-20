import { CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";

type TImportStatistic = {
  created: number;
  updated: number;
}

const ResultsTab = ({
  importStatistic
                    }: {
  importStatistic: TImportStatistic
}) => {
  return [
    <h3 key='results-header'>Import Results</h3>,
    <div key='results-data' style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <CheckCircleOutlined style={{ color: "#52c41a", marginRight: "8px" }} />
        <span>Created: {importStatistic.created}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <SyncOutlined style={{ color: "#1890ff", marginRight: "8px" }} />
        <span>Updated: {importStatistic.updated}</span>
      </div>
    </div>
  ]
}

export default ResultsTab;
