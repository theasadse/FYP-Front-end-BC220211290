import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import 'antd/dist/reset.css'
import './styles.css'
import { ConfigProvider } from 'antd'

createRoot(document.getElementById('root')!).render(
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
