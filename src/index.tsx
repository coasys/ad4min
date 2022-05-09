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
import { AgentProvider } from './context/AgentContext';


ReactDOM.render(
  <React.StrictMode>
    <MantineProvider>
      <NotificationsProvider>
        <AgentProvider>
          <App />
        </AgentProvider>
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
