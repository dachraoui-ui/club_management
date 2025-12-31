import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import MemberDetails from "./pages/MemberDetails";
import Teams from "./pages/Teams";
import AddTeam from "./pages/AddTeam";
import EditTeam from "./pages/EditTeam";
import TeamDetails from "./pages/TeamDetails";
import Trainings from "./pages/Trainings"
import AddTraining from "./pages/AddTraining";
import EditTraining from "./pages/EditTraining";
import TrainingDetails from "./pages/TrainingDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import Finance from "./pages/Finance";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
