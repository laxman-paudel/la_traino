import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const TraineeDashboard = lazy(() => import("./pages/trainee/Dashboard"));
const LinkTrainer = lazy(() => import("./pages/trainee/LinkTrainer"));
const Presets = lazy(() => import("./pages/trainee/Presets"));
const Workouts = lazy(() => import("./pages/trainee/Workouts"));
const Diet = lazy(() => import("./pages/trainee/Diet"));
const Progress = lazy(() => import("./pages/trainee/Progress"));
const TrainerDashboard = lazy(() => import("./pages/trainer/Dashboard"));
const AssignWorkout = lazy(() => import("./pages/trainer/AssignWorkout"));
const AssignDiet = lazy(() => import("./pages/trainer/AssignDiet"));
const TraineeLogs = lazy(() => import("./pages/trainer/TraineeLogs"));
const Feedback = lazy(() => import("./pages/trainer/Feedback"));
const WorkoutPresets = lazy(() => import("./pages/trainer/WorkoutPresets"));
const DietPresets = lazy(() => import("./pages/trainer/DietPresets"));
const History = lazy(() => import("./pages/trainer/History"));
const Analytics = lazy(() => import("./pages/trainer/Analytics"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminPresets = lazy(() => import("./pages/admin/Presets"));
const AdminGlobalPresets = lazy(() => import("./pages/admin/GlobalPresets"));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/trainee/dashboard"
                  element={
                    <ProtectedRoute roles={["TRAINEE"]}>
                      <AppLayout><TraineeDashboard /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainee/link-trainer"
                  element={
                    <ProtectedRoute roles={["TRAINEE"]}>
                      <AppLayout><LinkTrainer /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainee/presets"
                  element={
                    <ProtectedRoute roles={["TRAINEE"]}>
                      <AppLayout><Presets /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainee/workouts"
                  element={
                    <ProtectedRoute roles={["TRAINEE"]}>
                      <AppLayout><Workouts /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainee/diet"
                  element={
                    <ProtectedRoute roles={["TRAINEE"]}>
                      <AppLayout><Diet /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainee/progress"
                  element={
                    <ProtectedRoute roles={["TRAINEE"]}>
                      <AppLayout><Progress /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/dashboard"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><TrainerDashboard /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/trainees/:id/workout"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><AssignWorkout /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/trainees/:id/diet"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><AssignDiet /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/trainees/:id/logs"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><TraineeLogs /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/trainees/:id/feedback"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><Feedback /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/presets/workout"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><WorkoutPresets /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/presets/diet"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><DietPresets /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/history"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><History /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/analytics"
                  element={
                    <ProtectedRoute roles={["TRAINER"]}>
                      <AppLayout><Analytics /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AppLayout><AdminUsers /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/presets"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AppLayout><AdminPresets /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/global-presets"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AppLayout><AdminGlobalPresets /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <AppLayout><AdminDashboard /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
