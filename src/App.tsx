import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const AddMember = lazy(() => import("./pages/AddMember"));
const MemberDetails = lazy(() => import("./pages/MemberDetails"));
const Teams = lazy(() => import("./pages/Teams"));
const AddTeam = lazy(() => import("./pages/AddTeam"));
const EditTeam = lazy(() => import("./pages/EditTeam"));
const TeamDetails = lazy(() => import("./pages/TeamDetails"));
const Trainings = lazy(() => import("./pages/Trainings"));
const AddTraining = lazy(() => import("./pages/AddTraining"));
const EditTraining = lazy(() => import("./pages/EditTraining"));
const TrainingDetails = lazy(() => import("./pages/TrainingDetails"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const AddEvent = lazy(() => import("./pages/AddEvent"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const Finance = lazy(() => import("./pages/Finance"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<Login />} />

              {/* Protected Routes with Layout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/members/new" element={<AddMember />} />
                <Route path="/members/:id" element={<MemberDetails />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/teams/new" element={<AddTeam />} />
                <Route path="/teams/:id" element={<TeamDetails />} />
                <Route path="/teams/:id/edit" element={<EditTeam />} />
                <Route path="/trainings" element={<Trainings />} />
                <Route path="/trainings/new" element={<AddTraining />} />
                <Route path="/trainings/:id" element={<TrainingDetails />} />
                <Route path="/trainings/:id/edit" element={<EditTraining />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/new" element={<AddEvent />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/edit" element={<EditEvent />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
    <SpeedInsights />
    <Analytics />
  </QueryClientProvider>
);

export default App;
