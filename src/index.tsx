import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';

ReactDOM.render(
  <React.StrictMode>
    <MantineProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
