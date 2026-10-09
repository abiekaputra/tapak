// Module responsible for mounting the Tapak operator console.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './styles/base.css';
import './styles/auth.css';
import './styles/console.css';
import './styles/detail.css';

createRoot(document.querySelector('#root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
