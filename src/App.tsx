
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import Layout from "@/components/layout/Layout"; // Fixed import path
import Index from "@/pages/Index";
import CourseTracker from "@/pages/CourseTracker";
import ResumeBuilder from "@/pages/ResumeBuilder";
import JobPortal from "@/pages/JobPortal";
import Exams from "@/pages/Exams";
import Settings from "@/pages/Settings";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="/course-tracker" element={<CourseTracker />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/job-portal" element={<JobPortal />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
