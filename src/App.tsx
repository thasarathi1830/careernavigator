
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import CourseTracker from "./pages/CourseTracker";
import JobPortal from "./pages/JobPortal";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Index />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/course-tracker"
            element={
              <Layout>
                <CourseTracker />
              </Layout>
            }
          />
          <Route
            path="/job-portal"
            element={
              <Layout>
                <JobPortal />
              </Layout>
            }
          />
          <Route
            path="/projects"
            element={
              <Layout>
                <Projects />
              </Layout>
            }
          />
          {/* Placeholder routes for future implementation */}
          <Route
            path="/exams"
            element={
              <Layout>
                <div className="container py-8">
                  <h1 className="text-3xl font-bold mb-6">Exams & Assignments</h1>
                  <p className="text-gray-500">This feature is coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/forum"
            element={
              <Layout>
                <div className="container py-8">
                  <h1 className="text-3xl font-bold mb-6">Discussion Forum</h1>
                  <p className="text-gray-500">This feature is coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <div className="container py-8">
                  <h1 className="text-3xl font-bold mb-6">Settings</h1>
                  <p className="text-gray-500">This feature is coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
