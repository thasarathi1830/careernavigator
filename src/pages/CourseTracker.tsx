import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const CourseTracker = () => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [semesterGPAs, setSemesterGPAs] = useState([
    { semester: "Fall 2023", sgpa: 3.4 },
    { semester: "Spring 2024", sgpa: 3.5 },
    { semester: "Fall 2024", sgpa: 3.7 },
    { semester: "Spring 2025", sgpa: 3.75 },
  ]);
  const [newSemester, setNewSemester] = useState({ semester: "", sgpa: "" });

  const calculateCGPA = () => {
    if (semesterGPAs.length === 0) return "0.00";
    const totalGPA = semesterGPAs.reduce((sum, sem) => sum + sem.sgpa, 0);
    return (totalGPA / semesterGPAs.length).toFixed(2);
  };

  const handleAddSemester = () => {
    if (newSemester.semester && newSemester.sgpa) {
      const sgpa = parseFloat(newSemester.sgpa);
      if (sgpa < 0 || sgpa > 4) {
        toast({
          title: "Invalid SGPA",
          description: "SGPA must be between 0 and 4",
          variant: "destructive",
        });
        return;
      }
      setSemesterGPAs([...semesterGPAs, { ...newSemester, sgpa }]);
      setNewSemester({ semester: "", sgpa: "" });
      toast({
        title: "Semester Added",
        description: "New semester GPA has been added successfully.",
      });
    }
  };

  const handleRemoveSemester = (semesterToRemove: string) => {
    setSemesterGPAs(semesterGPAs.filter(sem => sem.semester !== semesterToRemove));
    toast({
      title: "Semester Removed",
      description: "The semester has been removed successfully.",
    });
  };

  const [cgpa, setCgpa] = useState("3.75");

  const [courseGrades, setCourseGrades] = useState([
    { name: "CS101", grade: "A", points: 4.0, marksObtained: 92, totalMarks: 100 },
    { name: "CS201", grade: "B+", points: 3.3, marksObtained: 85, totalMarks: 100 },
    { name: "MATH241", grade: "A-", points: 3.7, marksObtained: 88, totalMarks: 100 },
    { name: "PHYS101", grade: "B", points: 3.0, marksObtained: 78, totalMarks: 100 },
    { name: "ENG110", grade: "A", points: 4.0, marksObtained: 94, totalMarks: 100 },
    { name: "CS301", grade: "A", points: 4.0, marksObtained: 95, totalMarks: 100 },
    { name: "CS350", grade: "A-", points: 3.7, marksObtained: 87, totalMarks: 100 },
    { name: "CS430", grade: "B+", points: 3.3, marksObtained: 83, totalMarks: 100 },
  ]);

  const [newCourse, setNewCourse] = useState({
    name: "",
    grade: "",
    points: 0,
    marksObtained: "",
    totalMarks: "100"
  });

  const gpaTrend = [
    { semester: "Fall 2023", gpa: 3.4 },
    { semester: "Spring 2024", gpa: 3.5 },
    { semester: "Fall 2024", gpa: 3.7 },
    { semester: "Spring 2025", gpa: 3.75 },
  ];

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

  const handleAddCourse = () => {
    if (newCourse.name && newCourse.grade && newCourse.marksObtained) {
      setCourseGrades([...courseGrades, {
        ...newCourse,
        points: calculatePoints(newCourse.grade),
        marksObtained: Number(newCourse.marksObtained),
        totalMarks: Number(newCourse.totalMarks)
      }]);
      setNewCourse({
        name: "",
        grade: "",
        points: 0,
        marksObtained: "",
        totalMarks: "100"
      });
      toast({
        title: "Course Added",
        description: "The new course has been added successfully."
      });
    }
  };

  const handleUpdateCourse = (index: number, field: string, value: string) => {
    const updatedCourses = [...courseGrades];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: field === 'marksObtained' ? Number(value) : value,
      points: field === 'grade' ? calculatePoints(value) : updatedCourses[index].points
    };
    setCourseGrades(updatedCourses);
    updateCGPA(updatedCourses);
  };

  const calculatePoints = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    };
    return gradePoints[grade] || 0;
  };

  const updateCGPA = (courses: typeof courseGrades) => {
    const totalPoints = courses.reduce((sum, course) => sum + course.points, 0);
    const newCGPA = (totalPoints / courses.length).toFixed(2);
    setCgpa(newCGPA);
  };

  const handleRemoveCourse = (index: number) => {
    const updatedCourses = courseGrades.filter((_, i) => i !== index);
    setCourseGrades(updatedCourses);
    updateCGPA(updatedCourses);
    toast({
      title: "Course Removed",
      description: "The course has been removed successfully."
    });
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Course Tracker</h1>
        <div className="flex items-center mt-4 md:mt-0 space-x-4">
          <div>
            <span className="text-sm text-gray-500">Current CGPA</span>
            <div className="text-2xl font-bold text-education-primary">
              {calculateCGPA()}
            </div>
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
        <Button 
          onClick={() => setEditMode(!editMode)}
          variant="outline"
          className="ml-4"
        >
          {editMode ? "Save Changes" : "Edit Courses"}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Semester GPAs</h3>
            <div className="flex gap-4">
              <Input
                placeholder="Semester (e.g., Fall 2023)"
                value={newSemester.semester}
                onChange={(e) => setNewSemester({ ...newSemester, semester: e.target.value })}
                className="w-48"
              />
              <Input
                type="number"
                placeholder="SGPA"
                value={newSemester.sgpa}
                onChange={(e) => setNewSemester({ ...newSemester, sgpa: e.target.value })}
                step="0.01"
                min="0"
                max="4"
                className="w-32"
              />
              <Button onClick={handleAddSemester}>Add Semester</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {semesterGPAs.map((sem) => (
              <Card key={sem.semester} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{sem.semester}</h4>
                    <p className="text-2xl font-bold text-education-primary">
                      {sem.sgpa.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveSemester(sem.semester)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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
                {editMode && (
                  <div className="flex gap-4 items-end">
                    <div className="grid grid-cols-5 gap-2">
                      <Input
                        placeholder="Course Code"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      />
                      <Select 
                        value={newCourse.grade}
                        onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map((grade) => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Marks"
                        type="number"
                        value={newCourse.marksObtained}
                        onChange={(e) => setNewCourse({ ...newCourse, marksObtained: e.target.value })}
                        min="0"
                        max={newCourse.totalMarks}
                      />
                      <Input
                        placeholder="Total Marks"
                        type="number"
                        value={newCourse.totalMarks}
                        onChange={(e) => setNewCourse({ ...newCourse, totalMarks: e.target.value })}
                        min="0"
                      />
                      <Button onClick={handleAddCourse}>Add</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      {editMode && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseGrades.map((course, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editMode ? (
                            <Input
                              value={course.name}
                              onChange={(e) => handleUpdateCourse(index, 'name', e.target.value)}
                            />
                          ) : (
                            course.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editMode ? (
                            <Select
                              value={course.grade}
                              onValueChange={(value) => handleUpdateCourse(index, 'grade', value)}
                            >
                              <SelectTrigger>
                                <SelectValue>{course.grade}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map((grade) => (
                                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(course.grade)}`}>
                              {course.grade}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editMode ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={course.marksObtained}
                                onChange={(e) => handleUpdateCourse(index, 'marksObtained', e.target.value)}
                                className="w-20"
                                min="0"
                                max={course.totalMarks}
                              />
                              <span>/</span>
                              <Input
                                type="number"
                                value={course.totalMarks}
                                onChange={(e) => handleUpdateCourse(index, 'totalMarks', e.target.value)}
                                className="w-20"
                                min="0"
                              />
                            </div>
                          ) : (
                            `${course.marksObtained}/${course.totalMarks}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.points.toFixed(1)}
                        </td>
                        {editMode && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCourse(index)}
                            >
                              Remove
                            </Button>
                          </td>
                        )}
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
