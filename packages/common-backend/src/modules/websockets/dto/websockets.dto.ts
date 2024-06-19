export interface WebsocketsEventDto {
  event: string;
  data: any;
}

export class WebsocketsErrorEventDto implements WebsocketsEventDto {
  event: 'error';
  data: {
    message: string;
  };
}
