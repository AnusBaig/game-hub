import { Navigate, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import GameDetailPage from "./pages/GameDetailPage";
import HomePage from "./pages/HomePage";
import Layout from "./pages/Layout";

const routes = createBrowserRouter([
  {
    index: true,
    errorElement: <ErrorPage />,
    element: <Navigate to='/games' />,
  },
  {
    path: "/games",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: ":id",
        element: <GameDetailPage />,
      },
    ],
  },
]);

export default routes;
