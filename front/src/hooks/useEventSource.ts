import { useEffect } from 'react';
import { getApiUrl } from 'utils/request';

export const useEventSource = <T>(
  url: string,
  onData: (data: T) => void,
  isSecure: boolean = true,
) => {
  if (isSecure) {
    const token = localStorage.getItem('token');
    url = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
  }
  useEffect(() => {
    const es = new EventSource(`${getApiUrl(url)}`);
    es.onmessage = (ev: MessageEvent) => {
      onData(JSON.parse(ev.data) as T);
    };
    return () => {
      es.close();
    };
  }, [url, onData]);
  return [];
};
