import React from "react";
import { LiquidityManager, LiquidityManagerCheckResponseDto } from "../../tools/api";
import { useIntl } from "umi";
import apiClient from "../../tools/client/apiClient";
import pick from "lodash/pick";
import { isRecordNew } from "../Table/Table";
import { useCheckConnection } from "../Inputs/useCheckConnection";

export const CheckLiquidityManagerConnection: React.FC<{ liquidityManager: LiquidityManager }> = ({ liquidityManager }) => {
  const intl = useIntl();
  const { button } = useCheckConnection({
    defaultSuccessMessage: intl.formatMessage({ id: 'pages.liquidityManagers.connectionSuccess' }),
    defaultErrorMessage: intl.formatMessage({ id: 'pages.liquidityManagers.connectionError' }),
    request() {
      const isNewRecord = isRecordNew(liquidityManager);
      const fields: (keyof LiquidityManager)[] = ['name', 'host', 'port', 'user', 'pass', 'database'];
      if (!isNewRecord) {
        fields.push('id');
      }

      return apiClient.liquidityManagers.checkConnection({
        requestBody: pick(liquidityManager, fields),
      }).then(checkResponse => {
        return {
          success: checkResponse.status === LiquidityManagerCheckResponseDto.status.CONNECTED,
          message: checkResponse.message,
        };
      })
    }
  });

  return button;
}
