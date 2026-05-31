import { lazy, Suspense, type ReactNode, type ComponentType } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import MainLayout from '../layouts/MainLayout'

function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('rw-chunk-reload') || 'false',
    )
    try {
      const component = await componentImport()
      window.sessionStorage.setItem('rw-chunk-reload', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('rw-chunk-reload', 'true')
        window.location.reload()
        return { default: () => <PageFallback /> as any }
      }
      throw error
    }
  })
}

const AboutPage = lazyWithRetry(() => import('../pages/About/AboutPage'))
const ComplaintPage = lazyWithRetry(() => import('../pages/Complaint/ComplaintPage'))
const ComplaintDetailPage = lazyWithRetry(() => import('../pages/ComplaintDetail/ComplaintDetailPage'))
const ComplaintHistoryPage = lazyWithRetry(() => import('../pages/ComplaintHistory/ComplaintHistoryPage'))
const MapPage = lazyWithRetry(() => import('../pages/Map/MapPage'))
const DashboardPage = lazyWithRetry(() => import('../pages/Dashboard/DashboardPage'))
const AssistantPage = lazyWithRetry(() => import('../pages/Assistant/AssistantPage'))
const HomePage = lazyWithRetry(() => import('../pages/Home/HomePage'))
const LanguagePage = lazyWithRetry(() => import('../pages/Language/LanguagePage'))
const RoadDetailsPage = lazyWithRetry(() => import('../pages/RoadDetails/RoadDetailsPage'))
const SettingsPage = lazyWithRetry(() => import('../pages/Settings/SettingsPage'))

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
