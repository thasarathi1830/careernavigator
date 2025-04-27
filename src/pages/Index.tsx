
import { useState, useEffect } from "react";
import { BookOpen, Briefcase, Calendar, FileText } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cgpa, setCgpa] = useState<number>(0);
  const [completedCourses, setCompletedCourses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch semester data for CGPA calculation
  useEffect(() => {
    const fetchSemestersData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data: semesterData, error } = await supabase
          .from('semester_courses')
          .select('semester_id, semester_name, sgpa')
          .eq('profile_id', user.id);
        
        if (error) throw error;
        
        // Get unique semesters
        const uniqueSemesters = Array.from(
          new Set(semesterData.map(item => item.semester_id))
        ).map(semesterId => {
          const semester = semesterData.find(item => item.semester_id === semesterId);
          return {
            id: semesterId,
            profile_id: user.id,
            semester_name: semester?.semester_name || '',
            sgpa: semester?.sgpa || 0,
            created_at: new Date().toISOString()
          };
        }).filter(semester => semester.sgpa > 0);
        
        // Calculate CGPA
        if (uniqueSemesters.length > 0) {
          const totalGpa = uniqueSemesters.reduce((sum, sem) => sum + sem.sgpa, 0);
          const calculatedCgpa = totalGpa / uniqueSemesters.length;
          setCgpa(parseFloat(calculatedCgpa.toFixed(2)));
        }
        
        // Count completed courses
        const { count, error: countError } = await supabase
          .from('semester_courses')
          .select('*', { count: 'exact' })
          .eq('profile_id', user.id)
          .not('grade', 'eq', 'IP');
          
        if (countError) throw countError;
        
        if (count !== null) {
          setCompletedCourses(count);
        }
      } catch (error) {
        console.error('Error fetching academic data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load academic data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSemestersData();
  }, [user, toast]);
  
  // Mock data
  const upcomingDeadlines = [
    {
      id: 1,
      title: "Database Systems Assignment",
      type: "assignment",
      date: "2025-04-28",
      course: "CS301",
    },
    {
      id: 2,
      title: "Machine Learning Midterm",
      type: "exam",
      date: "2025-05-02",
      course: "CS430",
    },
    {
      id: 3,
      title: "Web Development Project",
      type: "project",
      date: "2025-05-10",
      course: "CS350",
    },
  ];

  const recentJobs = [
    {
      id: 1,
      title: "Software Engineering Intern",
      company: "TechCorp",
      location: "Remote",
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Junior Data Analyst",
      company: "DataInsight",
      location: "New York",
      posted: "1 week ago",
    },
  ];

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" role="region" aria-label="Key statistics">
        <StatCard
          title="Current CGPA"
          value={loading ? "Loading..." : cgpa}
          icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
        />
        <StatCard
          title="Completed Courses"
          value={loading ? "Loading..." : completedCourses.toString()}
          icon={<Calendar className="h-6 w-6" aria-hidden="true" />}
        />
        <StatCard
          title="Active Projects"
          value="3"
          icon={<FileText className="h-6 w-6" aria-hidden="true" />}
        />
        <StatCard
          title="Job Applications"
          value="5"
          trend={{ value: 2, positive: true }}
          icon={<Briefcase className="h-6 w-6" aria-hidden="true" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <DashboardCard 
          title="Upcoming Deadlines" 
          aria-label="List of upcoming deadlines"
          className="lg:col-span-2"
        >
          <ul 
            className="space-y-4"
            aria-label="Upcoming deadlines list"
          >
            {upcomingDeadlines.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 gap-2"
                aria-label={`${item.title} due on ${new Date(item.date).toLocaleDateString()}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-md ${
                      item.type === "exam"
                        ? "bg-red-100 text-red-600"
                        : item.type === "project"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                    aria-hidden="true"
                  >
                    {item.type === "exam" ? (
                      <Calendar className="h-5 w-5" />
                    ) : item.type === "project" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      <span className="sr-only">Course:</span> {item.course} • 
                      <span className="sr-only">Due date:</span> {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full mt-4 border-education-primary text-education-primary hover:bg-education-light"
            aria-label="Navigate to deadlines page to view all upcoming deadlines"
            onClick={() => navigate("/exams")}
          >
            View All Deadlines
          </Button>
        </DashboardCard>
        
        <div className="space-y-6">
          <DashboardCard 
            title="Recent Job Opportunities" 
            aria-label="List of recent job opportunities"
          >
            <ul 
              className="space-y-4"
              aria-label="Recent job opportunities list"
            >
              {recentJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                  aria-label={`${job.title} at ${job.company} in ${job.location}, posted ${job.posted}`}
                >
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-gray-500">
                      <span className="sr-only">Company:</span> {job.company} • 
                      <span className="sr-only">Location:</span> {job.location}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="sr-only">Posted:</span> Posted {job.posted}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-education-primary text-education-primary hover:bg-education-light"
                    aria-label={`Apply for ${job.title} at ${job.company}`}
                  >
                    Apply
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full mt-4 border-education-primary text-education-primary hover:bg-education-light"
              aria-label="Browse all available job opportunities"
              onClick={() => navigate("/job-portal")}
            >
              Browse All Jobs
            </Button>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Index;
