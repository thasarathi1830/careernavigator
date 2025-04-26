import { SemesterCourse, Semester } from "@/types/SemesterCourses";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  BarChart,
} from "lucide-react";

const CourseTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [coursesBySemester, setCoursesBySemester] = useState<Record<string, SemesterCourse[]>>({});
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [cgpa, setCGPA] = useState<number>(0);
  
  const [newSemester, setNewSemester] = useState({
    name: "",
    sgpa: "0.0"
  });
  
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    credits: "3",
    grade: "A"
  });
  
  // Calculate CGPA from all semesters
  const calculateCGPA = (semesterList: Semester[]) => {
    if (semesterList.length === 0) {
      setCGPA(0);
      return;
    }
    
    const totalSGPA = semesterList.reduce((sum, semester) => sum + semester.sgpa, 0);
    const calculatedCGPA = totalSGPA / semesterList.length;
    setCGPA(parseFloat(calculatedCGPA.toFixed(2)));
  };
  
  // Fetch semester data
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Using type casting to bypass TypeScript checking
        const { data, error } = await supabase
          .from('semester_courses' as any)
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Group courses by semester
        const groupedSemesters: Record<string, Semester> = {};
        const groupedCourses: Record<string, SemesterCourse[]> = {};
        
        (data || []).forEach((course: any) => {
          const semesterData = course as unknown as SemesterCourse;
          
          if (!groupedSemesters[semesterData.semester_name]) {
            groupedSemesters[semesterData.semester_name] = {
              id: semesterData.semester_id,
              profile_id: semesterData.profile_id,
              semester_name: semesterData.semester_name,
              sgpa: semesterData.sgpa || 0,
              created_at: semesterData.created_at
            };
            
            groupedCourses[semesterData.semester_name] = [];
          }
          
          groupedCourses[semesterData.semester_name].push(semesterData);
        });
        
        setSemesters(Object.values(groupedSemesters));
        setCoursesBySemester(groupedCourses);
        
        // Calculate CGPA
        calculateCGPA(Object.values(groupedSemesters));
        
      } catch (error) {
        console.error("Error fetching semesters:", error);
        toast({
          title: "Error",
          description: "Failed to load semester data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSemesters();
  }, [user, toast]);
  
  // Toggle semester expansion
  const toggleSemesterExpansion = (semesterName: string) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semesterName]: !prev[semesterName]
    }));
  };
  
  // Handle input change for new semester
  const handleSemesterInputChange = (e) => {
    const { name, value } = e.target;
    setNewSemester({ ...newSemester, [name]: value });
  };
  
  // Handle input change for new course
  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };
  
  // Add new semester
  const handleAddSemester = async () => {
    if (!user) return;
    
    try {
      // Using type casting to bypass TypeScript checking
      const { error } = await supabase
        .from('semester_courses' as any)
        .insert({
          profile_id: user.id,
          semester_name: newSemester.name,
          sgpa: parseFloat(newSemester.sgpa),
        });
        
      if (error) throw error;
      
      setNewSemester({
        name: "",
        sgpa: "0.0"
      });
      
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Semester added successfully",
      });
      
      // Refetch data
      fetchSemesters();
    } catch (error) {
      console.error("Error adding semester:", error);
      toast({
        title: "Error",
        description: "Failed to add semester",
        variant: "destructive"
      });
    }
  };
  
  // Add new course to a semester
  const handleAddCourse = async () => {
    if (!user || !selectedSemester) return;
    
    try {
      const semester = semesters.find(s => s.semester_name === selectedSemester);
      
      if (!semester) {
        throw new Error("Selected semester not found");
      }
      
      // Using type casting to bypass TypeScript checking
      const { error } = await supabase
        .from('semester_courses' as any)
        .insert({
          profile_id: user.id,
          semester_name: selectedSemester,
          semester_id: semester.id,
          course_name: newCourse.name,
          course_code: newCourse.code,
          credits: parseInt(newCourse.credits),
          grade: newCourse.grade,
          sgpa: semester.sgpa
        });
        
      if (error) throw error;
      
      setNewCourse({
        name: "",
        code: "",
        credits: "3",
        grade: "A"
      });
      
      setCourseDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Course added successfully",
      });
      
      // Refetch data
      fetchSemesters();
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive"
      });
    }
  };
  
  // Delete a course
  const handleDeleteCourse = async (courseId: string) => {
    try {
      // Using type casting to bypass TypeScript checking
      const { error } = await supabase
        .from('semester_courses' as any)
        .delete()
        .eq('id', courseId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      
      // Refetch data
      fetchSemesters();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
    }
  };
  
  // Get grade point for a letter grade
  const getGradePoint = (grade: string): number => {
    switch (grade) {
      case "A+": return 4.0;
      case "A": return 4.0;
      case "A-": return 3.7;
      case "B+": return 3.3;
      case "B": return 3.0;
      case "B-": return 2.7;
      case "C+": return 2.3;
      case "C": return 2.0;
      case "C-": return 1.7;
      case "D+": return 1.3;
      case "D": return 1.0;
      case "F": return 0.0;
      default: return 0.0;
    }
  };
  
  // Update semester SGPA
  const updateSemesterSGPA = async (semesterName: string) => {
    const courses = coursesBySemester[semesterName] || [];
    
    if (courses.length === 0) return;
    
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    courses.forEach(course => {
      const credits = course.credits || 0;
      const gradePoint = getGradePoint(course.grade);
      
      totalCredits += credits;
      totalGradePoints += credits * gradePoint;
    });
    
    const newSGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    const roundedSGPA = parseFloat(newSGPA.toFixed(2));
    
    try {
      // Update all courses in this semester with the new SGPA
      for (const course of courses) {
        // Using type casting to bypass TypeScript checking
        await supabase
          .from('semester_courses' as any)
          .update({ sgpa: roundedSGPA })
          .eq('id', course.id);
      }
      
      toast({
        title: "Success",
        description: `SGPA for ${semesterName} updated to ${roundedSGPA}`,
      });
      
      // Refetch data
      fetchSemesters();
    } catch (error) {
      console.error("Error updating SGPA:", error);
      toast({
        title: "Error",
        description: "Failed to update SGPA",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Tracker</h1>
          <p className="text-gray-500 mt-1">Track your academic progress and GPA</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-education-primary hover:bg-education-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Semester</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Semester Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newSemester.name}
                  onChange={handleSemesterInputChange}
                  placeholder="e.g. Fall 2023"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sgpa" className="text-right">
                  Initial SGPA
                </Label>
                <Input
                  id="sgpa"
                  name="sgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={newSemester.sgpa}
                  onChange={handleSemesterInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSemester}>Add Semester</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">CGPA: {cgpa.toFixed(2)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-education-primary rounded-full"
              style={{ width: `${(cgpa / 4) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>0.0</span>
            <span>4.0</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 flex justify-center">
              Loading semester data...
            </CardContent>
          </Card>
        ) : semesters.length === 0 ? (
          <Card>
            <CardContent className="p-8 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-4">No semesters found. Add your first semester to get started.</p>
              <Button onClick={() => setDialogOpen(true)}>Add Semester</Button>
            </CardContent>
          </Card>
        ) : (
          semesters.map((semester) => (
            <Card key={semester.id} className="overflow-hidden">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSemesterExpansion(semester.semester_name)}>
                <div className="flex justify-between items-center">
                  <CardTitle>{semester.semester_name}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="font-semibold">SGPA: {semester.sgpa.toFixed(2)}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedSemesters[semester.semester_name] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedSemesters[semester.semester_name] && (
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateSemesterSGPA(semester.semester_name)}
                    >
                      Recalculate SGPA
                    </Button>
                    
                    <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedSemester(semester.semester_name)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Course to {selectedSemester}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Course Name
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={newCourse.name}
                              onChange={handleCourseInputChange}
                              placeholder="e.g. Introduction to Computer Science"
                              className="col-span-3"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">
                              Course Code
                            </Label>
                            <Input
                              id="code"
                              name="code"
                              value={newCourse.code}
                              onChange={handleCourseInputChange}
                              placeholder="e.g. CS101"
                              className="col-span-3"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="credits" className="text-right">
                              Credits
                            </Label>
                            <Input
                              id="credits"
                              name="credits"
                              type="number"
                              min="1"
                              max="6"
                              value={newCourse.credits}
                              onChange={handleCourseInputChange}
                              className="col-span-3"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">
                              Grade
                            </Label>
                            <Select
                              value={newCourse.grade}
                              onValueChange={(value) => setNewCourse({...newCourse, grade: value})}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="C+">C+</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="C-">C-</SelectItem>
                                <SelectItem value="D+">D+</SelectItem>
                                <SelectItem value="D">D</SelectItem>
                                <SelectItem value="F">F</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddCourse}>Add Course</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(coursesBySemester[semester.semester_name] || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No courses added yet. Add your first course.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (coursesBySemester[semester.semester_name] || []).map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.course_code}</TableCell>
                            <TableCell>{course.course_name}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                course.grade === 'A' || course.grade === 'A+' || course.grade === 'A-' 
                                  ? 'bg-green-100 text-green-800' 
                                  : course.grade === 'B+' || course.grade === 'B' || course.grade === 'B-'
                                  ? 'bg-blue-100 text-blue-800'
                                  : course.grade === 'C+' || course.grade === 'C' || course.grade === 'C-'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {course.grade}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteCourse(course.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseTracker;
