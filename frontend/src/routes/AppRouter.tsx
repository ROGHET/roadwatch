import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import MainLayout from '../layouts/MainLayout'

const AboutPage = lazy(() => import('../pages/About/AboutPage'))
const ComplaintPage = lazy(() => import('../pages/Complaint/ComplaintPage'))
const ComplaintDetailPage = lazy(() => import('../pages/ComplaintDetail/ComplaintDetailPage'))
const ComplaintHistoryPage = lazy(() => import('../pages/ComplaintHistory/ComplaintHistoryPage'))
const MapPage = lazy(() => import('../pages/Map/MapPage'))
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'))
const AssistantPage = lazy(() => import('../pages/Assistant/AssistantPage'))
const HomePage = lazy(() => import('../pages/Home/HomePage'))
const LanguagePage = lazy(() => import('../pages/Language/LanguagePage'))
const RoadDetailsPage = lazy(() => import('../pages/RoadDetails/RoadDetailsPage'))
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'))

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
        element: (
          <LazyPage>
            <HomePage />
          </LazyPage>
        ),
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
        element: (
          <LazyPage>
            <RoadDetailsPage />
          </LazyPage>
        ),
      },
      {
        path: 'complaint',
        element: (
          <LazyPage>
            <ComplaintPage />
          </LazyPage>
        ),
      },
      {
        path: 'complaints/:complaintId',
        element: (
          <LazyPage>
            <ComplaintDetailPage />
          </LazyPage>
        ),
      },
      {
        path: 'complaint-history',
        element: (
          <LazyPage>
            <ComplaintHistoryPage />
          </LazyPage>
        ),
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
        element: (
          <LazyPage>
            <SettingsPage />
          </LazyPage>
        ),
      },
      {
        path: 'language',
        element: (
          <LazyPage>
            <LanguagePage />
          </LazyPage>
        ),
      },
      {
        path: 'about',
        element: (
          <LazyPage>
            <AboutPage />
          </LazyPage>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
