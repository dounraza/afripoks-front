import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { OnlineUserProvider } from './contexts/OnlineUserContext';
import { JoinedTableProvider } from './contexts/JoinedTableContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OnlineUserProvider>
      <JoinedTableProvider>
        <App />
      </JoinedTableProvider>
    </OnlineUserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
