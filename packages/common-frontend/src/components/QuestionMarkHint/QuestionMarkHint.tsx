import React from "react";
import { Popover } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { PrimitiveType } from "intl-messageformat";
import { useIntl } from "react-intl";

const QuestionMarkHint: React.FC<{
  intlPrefix: string,
  values?: Record<string, PrimitiveType | React.ReactElement>
}> = ({
  intlPrefix,
  values,
}) => {
  const intl = useIntl();
  return (
    <Popover
      content={(
        <div
          style={{
            maxWidth: 300,
          }}
        >{intl.formatMessage({ id: `${intlPrefix}.hint.message` }, values)}</div>
      )}
      title={intl.formatMessage({ id: `${intlPrefix}.hint.title` })}
      trigger={['hover', 'click']}
      zIndex={1080}
    >
      <QuestionCircleTwoTone />
    </Popover>
  )
}

export default QuestionMarkHint;
