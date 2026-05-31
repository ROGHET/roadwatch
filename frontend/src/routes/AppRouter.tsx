import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import MainLayout from '../layouts/MainLayout'
import ComplaintPage from '../pages/Complaint/ComplaintPage'
import ComplaintDetailPage from '../pages/ComplaintDetail/ComplaintDetailPage'
import ComplaintHistoryPage from '../pages/ComplaintHistory/ComplaintHistoryPage'
import HomePage from '../pages/Home/HomePage'
import RoadDetailsPage from '../pages/RoadDetails/RoadDetailsPage'
import SettingsPage from '../pages/Settings/SettingsPage'
import LanguagePage from '../pages/Language/LanguagePage'
import AboutPage from '../pages/About/AboutPage'

const MapPage = lazy(() => import('../pages/Map/MapPage'))
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'))
const AssistantPage = lazy(() => import('../pages/Assistant/AssistantPage'))

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center py-16">
      <LoadingSpinner label="Loading page" />
    </div>
  )
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

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
        element: (
          <LazyPage>
            <MapPage />
          </LazyPage>
        ),
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
        element: (
          <LazyPage>
            <DashboardPage />
          </LazyPage>
        ),
      },
      {
        path: 'assistant',
        element: (
          <LazyPage>
            <AssistantPage />
          </LazyPage>
        ),
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
