import { BookOpen, Briefcase, Calendar, FileText } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";

const Index = () => {
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

  // Calculate initial CGPA from the mock data
  const initialSemesterGPAs = [
    { semester: "1st (Odd) Semester", sgpa: 8.4 },
    { semester: "2nd (Even) Semester", sgpa: 8.5 },
    { semester: "3rd (Odd) Semester", sgpa: 8.7 },
    { semester: "4th (Even) Semester", sgpa: 8.75 },
    { semester: "5th (Odd) Semester", sgpa: 8.8 },
    { semester: "6th (Even) Semester", sgpa: 8.6 },
    { semester: "7th (Odd) Semester", sgpa: 8.9 },
    { semester: "8th (Even) Semester", sgpa: 8.85 }
  ];

  const calculateCGPA = (semesters: typeof initialSemesterGPAs) => {
    if (semesters.length === 0) return 0;
    const totalGPA = semesters.reduce((sum, sem) => sum + sem.sgpa, 0);
    return totalGPA / semesters.length;
  };

  const cgpa = calculateCGPA(initialSemesterGPAs);

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current CGPA"
          value={cgpa}
          trend={{ value: 5, positive: true }}
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          title="Completed Courses"
          value="18"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Active Projects"
          value="3"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Job Applications"
          value="5"
          trend={{ value: 2, positive: true }}
          icon={<Briefcase className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard title="Upcoming Deadlines">
          <div className="space-y-4">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-md ${
                      item.type === "exam"
                        ? "bg-red-100 text-red-600"
                        : item.type === "project"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
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
                      {item.course} • Due{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-education-primary hover:text-education-primary hover:bg-education-light"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full border-education-primary text-education-primary hover:bg-education-light"
            >
              See All Deadlines
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Job Opportunities">
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-gray-500">
                    {job.company} • {job.location}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Posted {job.posted}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-education-primary text-education-primary hover:bg-education-light"
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full border-education-primary text-education-primary hover:bg-education-light"
            >
              Browse All Jobs
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Index;
