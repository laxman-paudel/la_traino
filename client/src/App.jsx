import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminPresets = lazy(() => import("./pages/admin/Presets"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
                  <TraineeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainee/link-trainer"
              element={
                <ProtectedRoute roles={["TRAINEE"]}>
                  <LinkTrainer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainee/presets"
              element={
                <ProtectedRoute roles={["TRAINEE"]}>
                  <Presets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainee/workouts"
              element={
                <ProtectedRoute roles={["TRAINEE"]}>
                  <Workouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainee/diet"
              element={
                <ProtectedRoute roles={["TRAINEE"]}>
                  <Diet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainee/progress"
              element={
                <ProtectedRoute roles={["TRAINEE"]}>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute roles={["TRAINER"]}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/trainees/:id/workout"
              element={
                <ProtectedRoute roles={["TRAINER"]}>
                  <AssignWorkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/trainees/:id/diet"
              element={
                <ProtectedRoute roles={["TRAINER"]}>
                  <AssignDiet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/trainees/:id/logs"
              element={
                <ProtectedRoute roles={["TRAINER"]}>
                  <TraineeLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/trainees/:id/feedback"
              element={
                <ProtectedRoute roles={["TRAINER"]}>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/presets"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminPresets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">404</h1>
                    <p className="mt-2 text-gray-500">Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
