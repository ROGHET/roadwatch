import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AssistantPage from '../pages/Assistant/AssistantPage'
import ComplaintPage from '../pages/Complaint/ComplaintPage'
import ComplaintDetailPage from '../pages/ComplaintDetail/ComplaintDetailPage'
import ComplaintHistoryPage from '../pages/ComplaintHistory/ComplaintHistoryPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import HomePage from '../pages/Home/HomePage'
import MapPage from '../pages/Map/MapPage'
import RoadDetailsPage from '../pages/RoadDetails/RoadDetailsPage'
import SettingsPage from '../pages/Settings/SettingsPage'
import LanguagePage from '../pages/Language/LanguagePage'
import AboutPage from '../pages/About/AboutPage'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'map',
        element: <MapPage />,
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
        path: 'complaints/:complaintId',
        element: <ComplaintDetailPage />,
      },
      {
        path: 'complaint-history',
        element: <ComplaintHistoryPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'assistant',
        element: <AssistantPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'language',
        element: <LanguagePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
