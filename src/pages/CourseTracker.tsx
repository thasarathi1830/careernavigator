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
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CourseTracker = () => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [semesterGPAs, setSemesterGPAs] = useState([
    { semester: "1st (Odd) Semester", sgpa: 8.4 },
    { semester: "2nd (Even) Semester", sgpa: 8.5 },
    { semester: "3rd (Odd) Semester", sgpa: 8.7 },
    { semester: "4th (Even) Semester", sgpa: 8.75 },
    { semester: "5th (Odd) Semester", sgpa: 8.8 },
    { semester: "6th (Even) Semester", sgpa: 8.6 },
    { semester: "7th (Odd) Semester", sgpa: 8.9 },
    { semester: "8th (Even) Semester", sgpa: 8.85 }
  ]);
  const [newSemester, setNewSemester] = useState({ semester: "", sgpa: "" });
  const [cgpa, setCgpa] = useState("8.75");
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
  const [gpaTrend, setGpaTrend] = useState([
    { semester: "1st (Odd)", gpa: 8.4 },
    { semester: "2nd (Even)", gpa: 8.5 },
    { semester: "3rd (Odd)", gpa: 8.7 },
    { semester: "4th (Even)", gpa: 8.75 },
    { semester: "5th (Odd)", gpa: 8.8 },
    { semester: "6th (Even)", gpa: 8.6 },
    { semester: "7th (Odd)", gpa: 8.9 },
    { semester: "8th (Even)", gpa: 8.85 }
  ]);
  const [currentCourses, setCurrentCourses] = useState([
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
  ]);

  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    grade: "",
    marksObtained: "",
    totalMarks: "100",
  });

  const calculateCGPA = () => {
    if (semesterGPAs.length === 0) return "0.00";
    const totalGPA = semesterGPAs.reduce((sum, sem) => sum + sem.sgpa, 0);
    return (totalGPA / semesterGPAs.length).toFixed(2);
  };

  const handleAddSemester = () => {
    if (newSemester.semester && newSemester.sgpa) {
      const sgpa = parseFloat(newSemester.sgpa);
      if (sgpa < 0 || sgpa > 10) {
        toast({
          title: "Invalid SGPA",
          description: "SGPA must be between 0 and 10",
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

  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.code || !newCourse.grade || !newCourse.marksObtained) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const marks = parseInt(newCourse.marksObtained);
    const total = parseInt(newCourse.totalMarks);

    if (isNaN(marks) || isNaN(total) || marks > total) {
      toast({
        title: "Invalid Marks",
        description: "Please enter valid marks",
        variant: "destructive",
      });
      return;
    }

    setCourseGrades([
      ...courseGrades,
      {
        name: newCourse.code,
        grade: newCourse.grade,
        points: calculatePoints(newCourse.grade),
        marksObtained: marks,
        totalMarks: total,
      },
    ]);

    setNewCourse({
      name: "",
      code: "",
      grade: "",
      marksObtained: "",
      totalMarks: "100",
    });
    setIsAddingCourse(false);

    toast({
      title: "Course Added",
      description: "New course has been added successfully",
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
                max="10"
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

      <Tabs defaultValue="past">
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Past Courses</h3>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddingCourse(!isAddingCourse)}
                  aria-label={isAddingCourse ? "Cancel adding course" : "Add new course"}
                >
                  {isAddingCourse ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </>
                  )}
                </Button>
              </div>

              {isAddingCourse && (
                <div className="mb-6 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseName">Course Name</Label>
                      <Input
                        id="courseName"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        placeholder="e.g., Introduction to Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="courseCode">Course Code</Label>
                      <Input
                        id="courseCode"
                        value={newCourse.code}
                        onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                        placeholder="e.g., CS101"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        value={newCourse.grade}
                        onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"].map(
                            (grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="marks">Marks Obtained</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="marks"
                          type="number"
                          value={newCourse.marksObtained}
                          onChange={(e) =>
                            setNewCourse({ ...newCourse, marksObtained: e.target.value })
                          }
                          placeholder="Marks obtained"
                          min="0"
                          max={newCourse.totalMarks}
                        />
                        <span>/</span>
                        <Input
                          type="number"
                          value={newCourse.totalMarks}
                          onChange={(e) =>
                            setNewCourse({ ...newCourse, totalMarks: e.target.value })
                          }
                          min="0"
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddCourse} className="mt-4">
                    Add Course
                  </Button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Course Code</th>
                      <th className="text-left py-2">Grade</th>
                      <th className="text-left py-2">Marks</th>
                      <th className="text-left py-2">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseGrades.map((course, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-3">{course.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${getGradeColor(course.grade)}`}>
                            {course.grade}
                          </span>
                        </td>
                        <td className="py-3">
                          {course.marksObtained}/{course.totalMarks}
                        </td>
                        <td className="py-3">{course.points.toFixed(1)}</td>
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
