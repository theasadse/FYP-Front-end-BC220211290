/**
 * Entry point of the React application.
 *
 * This file is responsible for:
 * 1. Mounting the React application into the DOM.
 * 2. Configuring the Router (HashRouter).
 * 3. Applying Ant Design global configuration (ConfigProvider) with a custom theme.
 * 4. Importing global styles.
 *
 * @module Main
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import 'antd/dist/reset.css'
import './styles.css'
import { ConfigProvider } from 'antd'

// Find the root element in the DOM
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

// Create a root for React to render into
const root = createRoot(container);

// Render the application
root.render(
  <React.StrictMode>
  <HashRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#5b8def',
            colorBgLayout: '#f4f7fb',
            colorBgContainer: '#ffffff',
            borderRadius: 10,
            colorText: '#17223b',
            colorTextSecondary: '#5f6f88'
          }
        }}
      >
        <App />
      </ConfigProvider>
  </HashRouter>
  </React.StrictMode>
)
