// components/layout/Layout.tsx

import { Box } from "@chakra-ui/react";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" overflowY="auto">
      <Header />

      <Box flex="1">
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}