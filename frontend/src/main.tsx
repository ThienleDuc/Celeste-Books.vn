import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/assets/css/conversation.css'
import '../src/assets/css/style.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
