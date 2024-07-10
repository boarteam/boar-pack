import { ProColumns } from "@ant-design/pro-components";
import { useQuotes } from "./QuotesDataSource";
import React, { useState } from "react";
import { QuoteDto } from "../../tools/api-client";
import dayjs from "dayjs";

export interface Quote {
  symbol: string;
  bid?: number;
  ask?: number;
  timestamp?: Date;
  group: string;
}

const Ticker: React.FC<{
  symbol: string,
  quoteParam: 'bid' | 'ask' | 'timestamp',
  format?: (value: any) => string,
}> = ({
  symbol,
  quoteParam,
  format
}) => {
  const { quotesDataSource } = useQuotes();
  const [ quote, setQuote ] = useState<QuoteDto | null>(null);

  quotesDataSource.quotesEvents.addEventListener(`quote:${symbol}`, (event: CustomEvent<QuoteDto>) => {
    setQuote(event.detail);
  });

  const value = quote
    ? (format?.(quote[quoteParam]) || quote[quoteParam])
    : 'N/A';

  return <span>{value}</span>;
}

export const useQuotesColumns = (): ProColumns<Quote>[] => {
  return [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      width: '20%',
    },
    {
      title: 'Bid',
      dataIndex: 'bid',
      width: '20%',
      render: (_, record) => <Ticker symbol={record.symbol} quoteParam='bid' />,
    },
    {
      title: 'Ask',
      dataIndex: 'ask',
      width: '20%',
      render: (_, record) => <Ticker symbol={record.symbol} quoteParam='ask' />,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      width: '20%',
      render: (_, record) => <Ticker
        symbol={record.symbol}
        quoteParam='timestamp'
        // DD/MM/YYYY, HH:mm:ss.SSS
        format={(value) => dayjs(value).format('DD/MM/YYYY, HH:mm:ss.SSS')}
      />,
    },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '20%',
    }
  ];
};
