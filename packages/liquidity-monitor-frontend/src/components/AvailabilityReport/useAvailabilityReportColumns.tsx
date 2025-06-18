import { ProColumns } from "@ant-design/pro-components";
import { InstrumentsHistoryDto } from "../../tools/api-client";

export const useAvailabilityReportColumns = (columnFilters: {
  [key: string]: { text: string, value: string }[];
}): ProColumns<InstrumentsHistoryDto>[] => {
  return [
    {
      title: 'Symbol',
      dataIndex: "symbolName",
      sorter: true
    },
    {
      title: 'Instruments group',
      dataIndex: "groupName",
      ...(columnFilters?.['groupName'] && {
        filters: columnFilters?.['groupName'],
      })
    },
    {
      title: 'Trading platform',
      dataIndex: "platformName",
      ...(columnFilters?.['platformName'] && {
        filters: columnFilters?.['platformName'],
      })
    },
    {
      title: 'Availability',
      dataIndex: "availabilityPercent",
      renderText: (text: string) => {
        return `${text}%`;
      },
      sorter: true
    },
    {
      title: 'Off quotes',
      dataIndex: "scheduledOffQuotesDuration",
    },
    {
      title: 'Total downtime',
      dataIndex: "downtimeDuration",
    },
    {
      title: '№ incidents',
      dataIndex: "incidentsCount",
    },
    {
      title: 'Max incident duration',
      dataIndex: "maxIncidentDuration",
    },
    {
      title: 'Avg incident duration',
      dataIndex: "meanIncidentDuration",
    },
    {
      title: 'Downtime reasons',
      dataIndex: "reason",
    },
  ];
};
