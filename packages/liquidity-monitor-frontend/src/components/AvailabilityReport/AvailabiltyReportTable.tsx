import { Operators, Table, TGetAllParams } from "@boarteam/boar-pack-common-frontend";
import { useAvailabilityReportColumns } from "./useAvailabilityReportColumns";
import { InstrumentsHistoryDto, InstrumentsHistoryQueryDto } from "src/tools/api-client";
import apiClient from "../../tools/api-client/apiClient";
import { ReactNode } from "react";

const AvailabilityReportTable = ({
  start,
  end,
  toolbarFilters,
  columnFilters,
}: InstrumentsHistoryQueryDto & {
  toolbarFilters: ReactNode[],
  columnFilters: {
    [key: string]: { text: string, value: string }[]
  }
}) => {
  const columns = useAvailabilityReportColumns(columnFilters);

  const getAll = async (params: TGetAllParams) => {

    const allowedParams = {
      sort: params.sort?.[0],
      s: params.s
    };

    return apiClient.instrumentsHistory.getAvailabilityReport({
      ...allowedParams,
      ...(start && { start }),
      ...(end && { end }),
    });
  }

  return (
    <Table<InstrumentsHistoryDto>
      getAll={(params) => getAll(params)}
      params={{
        baseFilters: {
          start,
          end,
        }
      }}
      columns={columns}
      pathParams={{}}
      idColumnName={["symbolName", "platformName", "groupName"]}
      searchableColumns={[
        {
          field: 'start',
          operator: Operators.equals,
        },
        {
          field: 'end',
          operator: Operators.equals,
        },
        {
          field: 'groupName',
          operator: Operators.in,
        },
        {
          field: 'platformName',
          operator: Operators.in,
        }
      ]}
      toolbar={{
        search: false,
      }}
      toolBarRender={() => toolbarFilters}
      defaultSort={["availabilityPercent", "ASC"]}
      viewOnly={true}
      ghost={true}
    ></Table>
  );
}

export default AvailabilityReportTable;
