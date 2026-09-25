import { createBrowserRouter } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import Home from "@/components/pages/Home";
import MakingToken from "@/components/pages/MakingToken";
import NotFound from "@/components/pages/NotFound";
import MakingMap from "@/components/pages/MakingMap";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,

    children: [
      {
        index: true,
        element: <Home/>,
      },
      {
        path: "making-map",
        element: <MakingMap/>,
      },
      {
        path: "making-token",
        element: <MakingToken />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);