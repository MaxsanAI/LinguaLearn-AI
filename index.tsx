import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Use relative path for App component import
import App from './App';
// FIX: Use relative path for useTranslations hook import
import { TranslationsProvider } from './hooks/useTranslations';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const Main = () => {
  return (
    <TranslationsProvider>
      <App />
    </TranslationsProvider>
  );
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <Main />
);