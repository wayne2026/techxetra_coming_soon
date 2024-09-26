import { createRoot } from 'react-dom/client'
import React from 'react'
import './styles.css'
import App from './App'


createRoot(document.querySelector('#root')).render(
  <>
    <App />
  </>
)
