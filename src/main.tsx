import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "@/components/ui/provider"
import { router } from './routes/router.tsx'
import { RouterProvider } from 'react-router-dom'
import { MapContextProvider } from '@/components/provider/mapContext'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from './components/ui/color-mode.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <Provider>
          <MapContextProvider>
            <RouterProvider router={router} />
          </MapContextProvider>
        </Provider>
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>,
)
