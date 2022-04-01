import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { createContext } from 'react';
import { buildAd4mClient } from './util';
import { AD4M_ENDPOINT } from './config';

const ad4mClient = buildAd4mClient(AD4M_ENDPOINT);
export const Ad4mContext = createContext(ad4mClient);

ReactDOM.render(
  <React.StrictMode>
    <MantineProvider>
      <NotificationsProvider>
        <Ad4mContext.Provider value={ad4mClient}>
          <App />
        </Ad4mContext.Provider>
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
