import { baseUrl } from "./baseUrl";
import { SWRConfig } from "swr";
import { WsProvider } from "./ws";
import axios from "axios";
import { ReactNode } from "react";
import Cookies from 'js-cookie'

axios.defaults.baseURL = `${baseUrl}api/`;

type ApiProviderType = {
  children?: ReactNode;
  options?: Record<string, unknown>;
};

export function ApiProvider({ children, options }: ApiProviderType) {

  const token = Cookies.get('frigate_token');

  if(token === undefined) {
    window.location.href = '/login';
  }

  axios.defaults.headers.common = {
    "Authorization": `Bearer ${token}`,
    "X-CSRF-TOKEN": 1,
    "X-CACHE-BYPASS": 1,
  };

  return (
    <SWRConfig
      value={{
        fetcher: (key) => {
          const [path, params] = Array.isArray(key) ? key : [key, undefined];
          return axios.get(path, { params }).then((res) => res.data);
        },
        onError: (error, _key) => {
          if (
            error.response &&
            [401, 302, 307].includes(error.response.status)
          ) {
            // redirect to the login page if not already there
            const loginPage = error.response.headers.get("location") ?? "login";
            if (window.location.href !== loginPage) {
              window.location.href = loginPage;
            }
          }
        },
        ...options,
      }}
    >
      <WsWithConfig>{children}</WsWithConfig>
    </SWRConfig>
  );
}

type WsWithConfigType = {
  children: ReactNode;
};

function WsWithConfig({ children }: WsWithConfigType) {
  return <WsProvider>{children}</WsProvider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApiHost() {
  return baseUrl;
}
