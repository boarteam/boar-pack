import { Tooltip } from "antd";
import { ProColumns } from "@ant-design/pro-components";
import { InstrumentsHistoryDto } from "../../tools/api-client";

export const useAvailabilityReportColumns = (columnFilters: {
  [key: string]: { text: string, value: string }[];
}): ProColumns<InstrumentsHistoryDto>[] => {
  return [
    {
      title: (
        <Tooltip title='Instrument'>
          Trading instrument name
        </Tooltip>
      ),
      dataIndex: "symbolName",
      sorter: true
    },
    {
      title: (
        <Tooltip title='Group'>
          Instruments group
        </Tooltip>
      ),
      dataIndex: "groupName",
      ...(columnFilters?.['groupName'] && {
        filters: columnFilters?.['groupName'],
      })
    },
    {
      title: (
        <Tooltip title='Platform'>
          Trading platform
        </Tooltip>
      ),
      dataIndex: "platformName",
      ...(columnFilters?.['platformName'] && {
        filters: columnFilters?.['platformName'],
      })
    },
    {
      title: (
        <Tooltip title='Availability %'>
          Instrument availability percentage
        </Tooltip>
      ),
      dataIndex: "availabilityPercent",
      renderText: (text: string) => {
        return `${text}%`;
      },
      sorter: true
    },
    {
      title: (
        <Tooltip title='Scheduled Off (hh:mm)'>
          Scheduled quotes downtime duration
        </Tooltip>
      ),
      dataIndex: "scheduledOffQuotesDuration",
    },
    {
      title: (
        <Tooltip title='Downtime (hh:mm)'>
          Total downtime duration
        </Tooltip>
      ),
      dataIndex: "downtimeDuration",
    },
    {
      title: (
        <Tooltip title='Incidents'>
          Number of downtime incidents
        </Tooltip>
      ),
      dataIndex: "incidentsCount",
    },
    {
      title: (
        <Tooltip title='Max Incident (hh:mm)'>
          Maximum duration of a single incident
        </Tooltip>
      ),
      dataIndex: "maxIncidentDuration",
    },
    {
      title: (
        <Tooltip title='Avg Incident (hh:mm)'>
          Average incident duration
        </Tooltip>
      ),
      dataIndex: "meanIncidentDuration",
    },
    {
      title: (
        <Tooltip title='Reasons'>
          Downtime reasons with duration (hh:mm)
        </Tooltip>
      ),
      dataIndex: "reason",
    },
  ];
};
