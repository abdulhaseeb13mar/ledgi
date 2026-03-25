import { lazy } from "react";

import App from "@/App";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { auth } from "@/lib/firebase";
import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";

const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const CreateDuePage = lazy(() => import("@/pages/create-due"));
const DuesOwedPage = lazy(() => import("@/pages/dues-owed"));
const DuesOwedDetailPage = lazy(() => import("@/pages/dues-owed-detail"));
const DuesReceivablePage = lazy(() => import("@/pages/dues-receivable"));
const DuesReceivableDetailPage = lazy(() => import("@/pages/dues-receivable-detail"));
const ConfirmDuesPage = lazy(() => import("@/pages/confirm-dues"));
const PendingDuesPage = lazy(() => import("@/pages/pending-dues"));
const SettingsPage = lazy(() => import("@/pages/settings"));

function requireAuth() {
  if (!auth.currentUser) {
    throw redirect({ to: "/login" });
  }
}

function redirectIfAuthed() {
  if (auth.currentUser) {
    throw redirect({ to: "/" });
  }
}

// Root
const rootRoute = createRootRoute({
  component: App,
});

// Auth layout
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth-layout",
  component: AuthLayout,
  beforeLoad: redirectIfAuthed,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/register",
  component: RegisterPage,
});

// Dashboard layout
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  component: DashboardLayout,
  beforeLoad: requireAuth,
});

const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  component: DashboardPage,
});

const createDueRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/create",
  component: CreateDuePage,
});

const duesOwedRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/owed",
  component: DuesOwedPage,
});

const duesOwedDetailRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/owed/$userId",
  component: DuesOwedDetailPage,
});

const duesReceivableRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/receivable",
  component: DuesReceivablePage,
});

const duesReceivableDetailRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/receivable/$userId",
  component: DuesReceivableDetailPage,
});

const confirmDuesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/confirm",
  component: ConfirmDuesPage,
});

const pendingDuesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dues/pending",
  component: PendingDuesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  dashboardLayoutRoute.addChildren([
    dashboardRoute,
    createDueRoute,
    duesOwedRoute,
    duesOwedDetailRoute,
    duesReceivableRoute,
    duesReceivableDetailRoute,
    confirmDuesRoute,
    pendingDuesRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
