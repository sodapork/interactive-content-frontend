import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MemberstackProvider } from '@memberstack/react';

console.log('Memberstack public key:', process.env.REACT_APP_MEMBERSTACK_PUBLIC_KEY);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// NOTE: If you see a prop error, check the Memberstack React docs for the correct prop name (publicKey, projectId, or clientId)
root.render(
  <React.StrictMode>
    <MemberstackProvider config={{ publicKey: process.env.REACT_APP_MEMBERSTACK_PUBLIC_KEY! }}>
      <App />
    </MemberstackProvider>
  </React.StrictMode>
); 