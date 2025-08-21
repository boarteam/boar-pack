import { Descriptions, TImportConflict } from "@boarteam/boar-pack-common-frontend";
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
      ".ant-descriptions-row > *:nth-child(1), .ant-descriptions-row > *:nth-child(2)": {

      },
      ".ant-descriptions-row > *:nth-child(3)": {

      },
      ".ant-descriptions-row > *:nth-child(4)": {
        backgroundColor: "#f0fff0 !important",
      },
    },
  };
});

const getCurrentKey = (field: string) => {
  return `${field}-current`;
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
  setResolvedData?: Dispatch<SetStateAction<Entity[]>>;
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

  /*Initial value based on received conflicts
  {
    field: 'importing field value',
    field-current: 'current field name from server',
    ...
  }*/
  const [resolvedData, setLocalResolvedData] = useState<Partial<Entity>[]>(conflicts.map(conflict => (
    conflict.fields.reduce((acc, currentValue) => {
      const key = getNormalizedKey(currentValue.field);
      acc[key] = getRelationalData(key, currentValue.imported_value);
      acc[getCurrentKey(key)] = getRelationalData(key, currentValue.current_value);

      return acc;
    }, {})
  )));

  useEffect(() => {
    if (!setResolvedData) return;

    const payload = resolvedData.map((obj, i) => {
      const data = { ...obj };
      // Remove all -current postfix keys from the resolved data
      Object.keys(obj).forEach(key => {
        if (key.endsWith('-current')) {
          delete data[key];
        }
      })

      return {
        id: conflicts[i].id,
        ...data,
        version: conflicts[i].version,
      }
    });

    setResolvedData(payload);
  }, [resolvedData, conflicts, setResolvedData]);

  const { styles } = useStyles();

  const useCurrentValue = (conflict: TImportConflict, field: string) => {
    const key = getNormalizedKey(field);

    // Update the resolved data for this conflict
    setLocalResolvedData(prev => {
      const newData = [...prev];
      const index = conflicts.indexOf(conflict);
      newData[index] = {
        ...newData[index],
        [key]: newData[index][getCurrentKey(key)],
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
        dataIndex: getCurrentKey(key),
        editable: false,
      });
      conflictColumns.push({
        ...originColumn,
        title: (
          <div style={{ textAlign: 'center' }}>
            <Tooltip title="Use value from server">
              <Button
                size="small"
                type="link"
                icon={<SwapOutlined />}
                onClick={() => useCurrentValue(conflict, field.field)}
              />
            </Tooltip>
          </div>
        ),
      });
    });

    return (
      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 15, width: "100%" }}>
        <div>
          <Tag color="error">ID {conflict.id}</Tag>
          <Tag color="blue">Server version: v{conflict.version}</Tag>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Current (From Server)</th>
              <th style={{ width: '50%' }}>New (Importing)</th>
            </tr>
          </thead>
        </table>
        <Descriptions
          size="small"
          bordered
          entity={resolvedData[idx]}
          columns={conflictColumns}
          column={2}
          canEdit={true}
          mainTitle={null}
          className={styles.conflictsStyle}
        >
        </Descriptions>
      </div>
    );
  });
}

export default ConflictsTab;
