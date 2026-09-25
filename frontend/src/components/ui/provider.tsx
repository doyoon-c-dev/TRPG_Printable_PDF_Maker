"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

interface ProviderProps {
  children: React.ReactNode}

export function Provider({children}:ProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  )
}
