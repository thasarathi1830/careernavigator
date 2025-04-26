
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, XCircle } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
}

interface SemesterData {
  id: string;
  semester_name: string;
  sgpa: number;
  courses: Course[];
}

const CourseTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSemester, setShowNewSemester] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<{ semesterId: string, courseId: string } | null>(null);
  const [cgpa, setCgpa] = useState<number>(0);
  
  const [newSemester, setNewSemester] = useState({
    semester_name: "",
    sgpa: 0
  });
  
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    credits: 4,
    grade: ""
  });
  
  const [tempSemester, setTempSemester] = useState({
    id: "",
    semester_name: "",
    sgpa: 0
  });
  
  const [tempCourse, setTempCourse] = useState<Course>({
    id: "",
    name: "",
    code: "",
    credits: 0,
    grade: ""
  });
  
  // Fetch semester data
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch semesters
        const { data: semesterData, error: semesterError } = await supabase
          .from('semester_courses')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: true });
          
        if (semesterError) throw semesterError;
        
        // Fetch courses for each semester
        const semestersWithCourses: SemesterData[] = [];
        
        for (const semester of semesterData) {
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .eq('profile_id', user.id)
            .filter('semester_id', 'eq', semester.id)
            .order('created_at', { ascending: true });
            
          if (coursesError) throw coursesError;
          
          semestersWithCourses.push({
            id: semester.id,
            semester_name: semester.semester_name,
            sgpa: semester.sgpa,
            courses: coursesData || []
          });
        }
        
        setSemesters(semestersWithCourses);
        calculateCGPA(semestersWithCourses);
      } catch (error) {
        console.error("Error fetching semester data:", error);
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
    
    // Set up real-time subscriptions
    const semesterChannel = supabase
      .channel('public:semester_courses')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'semester_courses' }, 
        () => {
          fetchSemesters(); // Refetch on any changes
        }
      )
      .subscribe();
      
    const coursesChannel = supabase
      .channel('public:courses')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'courses' }, 
        () => {
          fetchSemesters(); // Refetch on any changes
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(semesterChannel);
      supabase.removeChannel(coursesChannel);
    };
  }, [user, toast]);
  
  // Calculate CGPA
  const calculateCGPA = (semesterData: SemesterData[]) => {
    if (semesterData.length === 0) {
      setCgpa(0);
      return;
    }
    
    const totalPoints = semesterData.reduce((sum, semester) => sum + semester.sgpa, 0);
    const calculatedCGPA = totalPoints / semesterData.length;
    setCgpa(parseFloat(calculatedCGPA.toFixed(2)));
    
    // Update CGPA on profile
    if (user) {
      updateProfileCGPA(calculatedCGPA);
    }
  };
  
  // Update profile CGPA
  const updateProfileCGPA = async (newCGPA: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert({
          id: user.id,
          gpa: newCGPA.toFixed(2)
        }, {
          onConflict: 'id'
        });
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating profile CGPA:", error);
    }
  };
  
  // Add new semester
  const handleAddSemester = async () => {
    if (!user) return;
    
    try {
      // Create new semester
      const { data, error } = await supabase
        .from('semester_courses')
        .insert({
          profile_id: user.id,
          semester_name: newSemester.semester_name,
          sgpa: parseFloat(newSemester.sgpa.toString()) || 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Reset form and close dialog
      setNewSemester({
        semester_name: "",
        sgpa: 0
      });
      
      setShowNewSemester(false);
      
      toast({
        title: "Success",
        description: "Semester added successfully"
      });
      
      // Select the new semester
      setSelectedSemester(data.id);
    } catch (error) {
      console.error("Error adding semester:", error);
      toast({
        title: "Error",
        description: "Failed to add semester",
        variant: "destructive"
      });
    }
  };
  
  // Add new course to semester
  const handleAddCourse = async () => {
    if (!user || !selectedSemester) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          profile_id: user.id,
          semester_id: selectedSemester,
          name: newCourse.name,
          code: newCourse.code,
          credits: parseInt(newCourse.credits.toString()) || 4,
          grade: newCourse.grade
        });
        
      if (error) throw error;
      
      // Reset form and close dialog
      setNewCourse({
        name: "",
        code: "",
        credits: 4,
        grade: ""
      });
      
      setShowNewCourse(false);
      
      toast({
        title: "Success",
        description: "Course added successfully"
      });
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive"
      });
    }
  };
  
  // Delete semester
  const handleDeleteSemester = async (semesterId: string) => {
    try {
      // Delete all courses in the semester first
      const { error: coursesError } = await supabase
        .from('courses')
        .delete()
        .eq('semester_id', semesterId);
        
      if (coursesError) throw coursesError;
      
      // Then delete the semester
      const { error } = await supabase
        .from('semester_courses')
        .delete()
        .eq('id', semesterId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Semester deleted successfully"
      });
      
      // If the deleted semester was selected, clear selection
      if (selectedSemester === semesterId) {
        setSelectedSemester(null);
      }
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast({
        title: "Error",
        description: "Failed to delete semester",
        variant: "destructive"
      });
    }
  };
  
  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Course deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
    }
  };
  
  // Start editing semester
  const startEditingSemester = (semester: SemesterData) => {
    setEditingSemester(semester.id);
    setTempSemester({
      id: semester.id,
      semester_name: semester.semester_name,
      sgpa: semester.sgpa
    });
  };
  
  // Cancel editing semester
  const cancelEditingSemester = () => {
    setEditingSemester(null);
    setTempSemester({
      id: "",
      semester_name: "",
      sgpa: 0
    });
  };
  
  // Save semester edits
  const saveSemesterEdits = async () => {
    try {
      const { error } = await supabase
        .from('semester_courses')
        .update({
          semester_name: tempSemester.semester_name,
          sgpa: parseFloat(tempSemester.sgpa.toString()) || 0
        })
        .eq('id', tempSemester.id);
        
      if (error) throw error;
      
      setEditingSemester(null);
      setTempSemester({
        id: "",
        semester_name: "",
        sgpa: 0
      });
      
      toast({
        title: "Success",
        description: "Semester updated successfully"
      });
    } catch (error) {
      console.error("Error updating semester:", error);
      toast({
        title: "Error",
        description: "Failed to update semester",
        variant: "destructive"
      });
    }
  };
  
  // Start editing course
  const startEditingCourse = (semesterId: string, course: Course) => {
    setEditingCourse({ semesterId, courseId: course.id });
    setTempCourse({
      id: course.id,
      name: course.name,
      code: course.code,
      credits: course.credits,
      grade: course.grade
    });
  };
  
  // Cancel editing course
  const cancelEditingCourse = () => {
    setEditingCourse(null);
    setTempCourse({
      id: "",
      name: "",
      code: "",
      credits: 0,
      grade: ""
    });
  };
  
  // Save course edits
  const saveCourseEdits = async () => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          name: tempCourse.name,
          code: tempCourse.code,
          credits: parseInt(tempCourse.credits.toString()) || 4,
          grade: tempCourse.grade
        })
        .eq('id', tempCourse.id);
        
      if (error) throw error;
      
      setEditingCourse(null);
      setTempCourse({
        id: "",
        name: "",
        code: "",
        credits: 0,
        grade: ""
      });
      
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    }
  };
  
  const getGradeColor = (grade: string) => {
    if (!grade) return "text-gray-500";
    
    const gradeValue = grade.trim().toUpperCase();
    if (gradeValue === 'A' || gradeValue === 'A+' || gradeValue === 'A-') {
      return "text-green-600 font-semibold";
    } else if (gradeValue === 'B' || gradeValue === 'B+' || gradeValue === 'B-') {
      return "text-blue-600 font-semibold";
    } else if (gradeValue === 'C' || gradeValue === 'C+' || gradeValue === 'C-') {
      return "text-yellow-600 font-semibold";
    } else if (gradeValue === 'D' || gradeValue === 'D+' || gradeValue === 'D-') {
      return "text-orange-600 font-semibold";
    } else if (gradeValue === 'F') {
      return "text-red-600 font-semibold";
    }
    
    return "text-gray-600 font-semibold";
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Tracker</h1>
          <p className="text-gray-500 mt-1">Track your academic progress and calculate CGPA</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">
            CGPA: <span className="text-education-primary">{cgpa.toFixed(2)}</span>
          </div>
          <Button 
            onClick={() => {
              setShowNewSemester(true);
              setSelectedSemester(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>
        </div>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <p>Loading course data...</p>
          </CardContent>
        </Card>
      ) : semesters.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
            <p>You haven't added any semesters yet.</p>
            <Button onClick={() => setShowNewSemester(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Semester
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Semester List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Semesters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {semesters.map((semester) => (
                  <div 
                    key={semester.id}
                    className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                      selectedSemester === semester.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedSemester(semester.id)}
                  >
                    <div>
                      <p className="font-medium">{semester.semester_name}</p>
                      <p className="text-sm opacity-80">SGPA: {semester.sgpa.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingSemester(semester);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSemester(semester.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Course List */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {selectedSemester 
                  ? `Courses: ${semesters.find(s => s.id === selectedSemester)?.semester_name}`
                  : "Courses"
                }
              </CardTitle>
              
              {selectedSemester && (
                <Button onClick={() => setShowNewCourse(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedSemester ? (
                <div className="text-center p-8 text-gray-500">
                  Select a semester to view courses
                </div>
              ) : (
                <div>
                  {semesters.find(s => s.id === selectedSemester)?.courses.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <p>No courses added for this semester</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowNewCourse(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Course
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead className="text-center">Credits</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semesters
                          .find(s => s.id === selectedSemester)
                          ?.courses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">
                                {editingCourse?.courseId === course.id ? (
                                  <Input
                                    value={tempCourse.code}
                                    onChange={(e) => setTempCourse({...tempCourse, code: e.target.value})}
                                    className="h-8"
                                  />
                                ) : (
                                  course.code
                                )}
                              </TableCell>
                              <TableCell>
                                {editingCourse?.courseId === course.id ? (
                                  <Input
                                    value={tempCourse.name}
                                    onChange={(e) => setTempCourse({...tempCourse, name: e.target.value})}
                                    className="h-8"
                                  />
                                ) : (
                                  course.name
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {editingCourse?.courseId === course.id ? (
                                  <Input
                                    type="number"
                                    value={tempCourse.credits}
                                    onChange={(e) => setTempCourse({
                                      ...tempCourse, 
                                      credits: parseInt(e.target.value) || 0
                                    })}
                                    className="h-8 w-20 mx-auto"
                                  />
                                ) : (
                                  course.credits
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {editingCourse?.courseId === course.id ? (
                                  <Input
                                    value={tempCourse.grade}
                                    onChange={(e) => setTempCourse({...tempCourse, grade: e.target.value})}
                                    className="h-8 w-20 mx-auto"
                                  />
                                ) : (
                                  <span className={getGradeColor(course.grade)}>
                                    {course.grade || "N/A"}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {editingCourse?.courseId === course.id ? (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={saveCourseEdits}
                                        title="Save changes"
                                      >
                                        <Save className="h-4 w-4 text-green-500" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={cancelEditingCourse}
                                        title="Cancel editing"
                                      >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => startEditingCourse(selectedSemester, course)}
                                        title="Edit course"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDeleteCourse(course.id)}
                                        title="Delete course"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Add New Semester Dialog */}
      <Dialog open={showNewSemester} onOpenChange={setShowNewSemester}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Semester</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="semester_name">Semester Name</Label>
              <Input
                id="semester_name"
                placeholder="e.g. Fall 2024"
                value={newSemester.semester_name}
                onChange={(e) => setNewSemester({...newSemester, semester_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sgpa">Semester GPA</Label>
              <Input
                id="sgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 3.75"
                value={newSemester.sgpa || ""}
                onChange={(e) => setNewSemester({
                  ...newSemester, 
                  sgpa: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSemester(false)}>Cancel</Button>
            <Button onClick={handleAddSemester}>Add Semester</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add New Course Dialog */}
      <Dialog open={showNewCourse} onOpenChange={setShowNewCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course_code">Course Code</Label>
              <Input
                id="course_code"
                placeholder="e.g. CS101"
                value={newCourse.code}
                onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course_name">Course Name</Label>
              <Input
                id="course_name"
                placeholder="e.g. Introduction to Computer Science"
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={newCourse.credits || ""}
                  onChange={(e) => setNewCourse({
                    ...newCourse, 
                    credits: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade (Optional)</Label>
                <Input
                  id="grade"
                  placeholder="e.g. A, B+, etc."
                  value={newCourse.grade}
                  onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCourse(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Semester Dialog */}
      <Dialog open={!!editingSemester} onOpenChange={(open) => !open && cancelEditingSemester()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Semester</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_semester_name">Semester Name</Label>
              <Input
                id="edit_semester_name"
                value={tempSemester.semester_name}
                onChange={(e) => setTempSemester({...tempSemester, semester_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_sgpa">Semester GPA</Label>
              <Input
                id="edit_sgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={tempSemester.sgpa || ""}
                onChange={(e) => setTempSemester({
                  ...tempSemester, 
                  sgpa: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEditingSemester}>Cancel</Button>
            <Button onClick={saveSemesterEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseTracker;
