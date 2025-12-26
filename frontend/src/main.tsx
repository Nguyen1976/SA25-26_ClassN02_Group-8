import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { store } from './redux/store'
import { Provider } from 'react-redux'
import { injectStore } from './utils/authorizeAxios'

//Config redux persist
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { Toaster } from 'sonner'
const persistor = persistStore(store)

injectStore(store)

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
      <Toaster />
    </PersistGate>
  </Provider>
)
