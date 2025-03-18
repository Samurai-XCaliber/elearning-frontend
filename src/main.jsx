import {  StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { UserContextProvider } from './context/UserContext.jsx';
import { CourseContextProvider } from './context/CourseContext.jsx';
import { LiveClassContextProvider } from "./context/LiveClassContext"

export const server = "http://localhost:5000";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <CourseContextProvider>
      <LiveClassContextProvider>
        <App />
        </LiveClassContextProvider>
      </CourseContextProvider>
    </UserContextProvider>
  </StrictMode>
);
