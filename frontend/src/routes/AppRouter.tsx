import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AssistantPage from '../pages/Assistant/AssistantPage'
import ComplaintPage from '../pages/Complaint/ComplaintPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import HomePage from '../pages/Home/HomePage'
import RoadDetailsPage from '../pages/RoadDetails/RoadDetailsPage'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'road/:roadId',
        element: <RoadDetailsPage />,
      },
      {
        path: 'complaint',
        element: <ComplaintPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'assistant',
        element: <AssistantPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
