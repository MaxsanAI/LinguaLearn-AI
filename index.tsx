import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { TranslationsProvider } from './hooks/useTranslations.ts';

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
