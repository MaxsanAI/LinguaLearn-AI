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

// Register the service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}