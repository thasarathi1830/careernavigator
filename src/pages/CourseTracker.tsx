
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CourseTracker = () => {
  // Mock data for course grades
  const courseGrades = [
    { name: "CS101", grade: "A", points: 4.0 },
    { name: "CS201", grade: "B+", points: 3.3 },
    { name: "MATH241", grade: "A-", points: 3.7 },
    { name: "PHYS101", grade: "B", points: 3.0 },
    { name: "ENG110", grade: "A", points: 4.0 },
    { name: "CS301", grade: "A", points: 4.0 },
    { name: "CS350", grade: "A-", points: 3.7 },
    { name: "CS430", grade: "B+", points: 3.3 },
  ];

  // Mock data for GPA trend
  const gpaTrend = [
    { semester: "Fall 2023", gpa: 3.4 },
    { semester: "Spring 2024", gpa: 3.5 },
    { semester: "Fall 2024", gpa: 3.7 },
    { semester: "Spring 2025", gpa: 3.75 },
  ];

  // Mock data for current courses
  const currentCourses = [
    {
      code: "CS450",
      name: "Operating Systems",
      credits: 4,
      progress: 65,
      assignments: [
        { name: "Assignment 1", score: 92, total: 100 },
        { name: "Assignment 2", score: 88, total: 100 },
        { name: "Midterm Exam", score: 78, total: 100 },
      ],
    },
    {
      code: "CS480",
      name: "Computer Security",
      credits: 3,
      progress: 72,
      assignments: [
        { name: "Assignment 1", score: 95, total: 100 },
        { name: "Assignment 2", score: 90, total: 100 },
        { name: "Quiz 1", score: 85, total: 100 },
      ],
    },
    {
      code: "CS490",
      name: "Mobile App Development",
      credits: 3,
      progress: 58,
      assignments: [
        { name: "Project Proposal", score: 100, total: 100 },
        { name: "UI Design", score: 88, total: 100 },
        { name: "Sprint 1 Demo", score: 92, total: 100 },
      ],
    },
    {
      code: "MATH310",
      name: "Probability & Statistics",
      credits: 3,
      progress: 70,
      assignments: [
        { name: "Problem Set 1", score: 82, total: 100 },
        { name: "Problem Set 2", score: 88, total: 100 },
        { name: "Midterm Exam", score: 76, total: 100 },
      ],
    },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade.charAt(0)) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Course Tracker</h1>
        <div className="flex items-center mt-4 md:mt-0 space-x-4">
          <div>
            <span className="text-sm text-gray-500">Current GPA</span>
            <div className="text-2xl font-bold text-education-primary">3.75</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Credits Earned</span>
            <div className="text-2xl font-bold text-education-primary">54</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Remaining</span>
            <div className="text-2xl font-bold text-education-primary">66</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="current">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="current">Current Courses</TabsTrigger>
          <TabsTrigger value="past">Past Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentCourses.map((course, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{course.code}: {course.name}</h3>
                      <p className="text-sm text-gray-500">{course.credits} Credits</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Progress:</span>
                      <span className="font-bold">{course.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-education-primary h-2.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Recent Assessments</h4>
                    <div className="space-y-2">
                      {course.assignments.map((assignment, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="text-sm">{assignment.name}</span>
                          <div>
                            <span className="font-medium">{assignment.score}/{assignment.total}</span>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              {Math.round((assignment.score / assignment.total) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-education-primary text-education-primary hover:bg-education-light w-full"
                    >
                      View Course Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button className="bg-education-primary hover:bg-education-primary/90">
              Add New Course
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Past Courses</h3>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="spring2025">Spring 2025</SelectItem>
                      <SelectItem value="fall2024">Fall 2024</SelectItem>
                      <SelectItem value="spring2024">Spring 2024</SelectItem>
                      <SelectItem value="fall2023">Fall 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseGrades.map((course, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {course.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.name === "CS101" && "Introduction to Programming"}
                          {course.name === "CS201" && "Data Structures"}
                          {course.name === "MATH241" && "Calculus III"}
                          {course.name === "PHYS101" && "Physics I"}
                          {course.name === "ENG110" && "English Composition"}
                          {course.name === "CS301" && "Database Systems"}
                          {course.name === "CS350" && "Web Development"}
                          {course.name === "CS430" && "Machine Learning"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index < 2
                            ? "Fall 2023"
                            : index < 5
                            ? "Spring 2024"
                            : "Fall 2024"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index === 2 || index === 3 ? 3 : 4}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(
                              course.grade
                            )}`}
                          >
                            {course.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">GPA Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={gpaTrend}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[2, 4]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="gpa"
                        stroke="#3a55a2"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Course Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseGrades}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 4]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="points" fill="#8c54ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Credits Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-gray-500">Computer Science</h4>
                    <div className="text-2xl font-bold mt-2">32</div>
                    <div className="text-xs text-gray-500 mt-1">Credits</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-education-primary h-2 rounded-full"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1">80% complete</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-gray-500">Mathematics</h4>
                    <div className="text-2xl font-bold mt-2">12</div>
                    <div className="text-xs text-gray-500 mt-1">Credits</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-education-primary h-2 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1">60% complete</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-gray-500">Science</h4>
                    <div className="text-2xl font-bold mt-2">6</div>
                    <div className="text-xs text-gray-500 mt-1">Credits</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-education-primary h-2 rounded-full"
                        style={{ width: "50%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1">50% complete</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm text-gray-500">Humanities</h4>
                    <div className="text-2xl font-bold mt-2">4</div>
                    <div className="text-xs text-gray-500 mt-1">Credits</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-education-primary h-2 rounded-full"
                        style={{ width: "33%" }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1">33% complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseTracker;
