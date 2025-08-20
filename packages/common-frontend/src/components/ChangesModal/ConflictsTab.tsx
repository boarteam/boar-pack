import { Descriptions } from "@boarteam/boar-pack-common-frontend";
import { Tag, Tooltip, Button } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TImportResponse, TRelationalFields } from "./ChangesModal";
import { keyBy } from "lodash";
import { createStyles } from "antd-style";
import { SwapOutlined } from "@ant-design/icons";
import { ProColumns } from "@ant-design/pro-components";

const useStyles = createStyles(() => {
  return {
    conflictsStyle: {
      ".ant-descriptions-row > *:nth-child(3), .ant-descriptions-row > *:nth-child(4)": {
        backgroundColor: "#f0fff0 !important",
        width: "25%",
      },
      ".ant-descriptions-row > *:nth-child(1), .ant-descriptions-row > *:nth-child(2)": {
        width: "25%",
      },
    },
  };
});

const getImportedKey = (field: string) => {
  return `${field}-imported`;
};

const getNormalizedKey = (field: string) => {
  return field.replace('_id', '');
}

function ConflictsTab<Entity>({
  conflicts,
  relationalFields,
  setResolvedData,
  originColumns,
}: {
  conflicts?: TImportResponse['conflicts'],
  relationalFields?: TRelationalFields;
  setResolvedData?:  Dispatch<SetStateAction<Entity[]>>;
  originColumns: ProColumns<Entity>[];
}) {

  if (!conflicts || conflicts.length === 0) {
    return <p>No conflicts found.</p>;
  }

  const getRelationalData = (key: string, value: string) => {
    if (relationalFields?.has(key)) {
      const relation = relationalFields.get(key);
      return relation?.data[value] ?? null;
    }

    return value;
  };

  // Initial value based on received conflicts
  const [resolvedData, setLocalResolvedData] = useState<Partial<Entity>[]>(conflicts.map(conflict => (
    conflict.fields.reduce((acc, currentValue) => {
      const key = getNormalizedKey(currentValue.field);
      acc[key] = getRelationalData(key, currentValue.current_value);
      if (key !== 'version') {
        acc[getImportedKey(key)] = getRelationalData(key, currentValue.imported_value);
      }

      return acc;
    }, {})
  )));

  useEffect(() => {
    if (!setResolvedData) return;
    // Need to replace value for [field] using value from [field-imported] and then remove [field-imported]
    const payload = resolvedData.map((obj, i) => {
      const newObj = {
        id: conflicts[i].id,
        ...obj,
        version: conflicts[i].version,
      };

      Object.keys(newObj).forEach(key => {
        if (key.endsWith("-imported")) {
          const originalKey = key.replace("-imported", "");
          newObj[originalKey] = newObj[key];
          delete newObj[key];
        }
      });
      return newObj;
    });

    setResolvedData(payload);
  }, [resolvedData, conflicts, setResolvedData]);

  const { styles } = useStyles();

  const useServerValue = (conflictId: number, field: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    const fieldData = conflict.fields.find(f => f.field === field);
    if (!fieldData) return;

    const key = getNormalizedKey(field);
    const value = getRelationalData(key, fieldData.current_value);

    // Update the resolved data for this conflict
    setLocalResolvedData(prev => {
      const newData = [...prev];
      const index = conflicts.indexOf(conflict);
      newData[index] = {
        ...newData[index],
        [getImportedKey(key)]: value,
      };
      return newData;
    });
  };

  const keyedOriginColumns = keyBy(originColumns, "dataIndex");

  return conflicts.map((conflict, idx) => {
    const conflictColumns: ProColumns[] = [];

    conflict.fields.forEach(field => {
      const key = getNormalizedKey(field.field);
      const originColumn = keyedOriginColumns[key];
      conflictColumns.push({
        ...originColumn,
        editable: false,
      });
      conflictColumns.push({
        ...originColumn,
        dataIndex: getImportedKey(key),
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>New</span>
            <Tooltip title="Use value from server">
              <Button
                size="small"
                type="link"
                icon={<SwapOutlined />}
                onClick={() => useServerValue(conflict.id, field.field)}
              />
            </Tooltip>
          </div>
        ),
      });
    });

    return (
      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        <div>
          <Tag color="error">ID {conflict.id} (v{conflict.version})</Tag>
        </div>
        <Descriptions
          size="small"
          bordered
          entity={resolvedData[idx]}
          columns={conflictColumns}
          column={2}
          canEdit={true}
          // fieldsEditType={FieldsEdit.All}
          className={styles.conflictsStyle}
        >
        </Descriptions>
      </div>
    );
  });
}

export default ConflictsTab;
