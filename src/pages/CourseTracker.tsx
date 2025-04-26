import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SemesterCourse, Semester } from '@/types/SemesterCourses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Edit, Save } from 'lucide-react';

const CourseTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semesterCourses, setSemesterCourses] = useState<SemesterCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [newSemester, setNewSemester] = useState({ name: '', sgpa: 0 });
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    course_code: '',
    credits: 3,
    grade: 'A',
  });

  const fetchSemesters = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('semester_courses')
        .select('semester_name, sgpa, semester_id')
        .eq('profile_id', user.id)
        .distinct('semester_id');

      if (error) throw error;

      const uniqueSemesters = data.map(item => ({
        id: item.semester_id,
        profile_id: user.id,
        semester_name: item.semester_name,
        sgpa: item.sgpa,
        created_at: new Date().toISOString()
      }));

      setSemesters(uniqueSemesters);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch semesters',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  const fetchCourses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('semester_courses')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSemesterCourses(data as SemesterCourse[]);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCourses();
    fetchSemesters();
  }, [fetchCourses, fetchSemesters]);

  const handleAddSemester = async () => {
    if (!user) return;
    if (!newSemester.name.trim()) {
      toast({
        title: 'Error',
        description: 'Semester name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const semesterId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('semester_courses')
        .insert({
          profile_id: user.id,
          semester_name: newSemester.name,
          sgpa: newSemester.sgpa,
          semester_id: semesterId
        });

      if (error) throw error;

      setNewSemester({ name: '', sgpa: 0 });
      setIsAddingSemester(false);
      fetchSemesters();
      
      toast({
        title: 'Success',
        description: 'Semester added successfully'
      });
    } catch (error) {
      console.error('Error adding semester:', error);
      toast({
        title: 'Error',
        description: 'Failed to add semester',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!user || !selectedSemester) return;
    if (!newCourse.course_name.trim() || !newCourse.course_code.trim()) {
      toast({
        title: 'Error',
        description: 'Course name and code are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get the semester name and SGPA for the selected semester
      const semester = semesters.find(s => s.id === selectedSemester);
      if (!semester) throw new Error('Selected semester not found');
      
      const { error } = await supabase
        .from('semester_courses')
        .insert({
          profile_id: user.id,
          course_name: newCourse.course_name,
          course_code: newCourse.course_code,
          credits: newCourse.credits,
          grade: newCourse.grade,
          semester_id: selectedSemester,
          semester_name: semester.semester_name,
          sgpa: semester.sgpa
        });

      if (error) throw error;

      setNewCourse({
        course_name: '',
        course_code: '',
        credits: 3,
        grade: 'A',
      });
      setIsAddingCourse(false);
      fetchCourses();
      
      toast({
        title: 'Success',
        description: 'Course added successfully'
      });
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: 'Error',
        description: 'Failed to add course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('semester_courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchCourses();
      
      toast({
        title: 'Success',
        description: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (id: string, updatedData: Partial<SemesterCourse>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('semester_courses')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      setEditingCourse(null);
      fetchCourses();
      
      toast({
        title: 'Success',
        description: 'Course updated successfully'
      });
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedSemester 
    ? semesterCourses.filter(course => course.semester_id === selectedSemester)
    : semesterCourses;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Course Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Semesters</CardTitle>
            <CardDescription>Select a semester to view courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className={!selectedSemester ? "w-full bg-primary/10" : "w-full"}
                onClick={() => setSelectedSemester(null)}
              >
                All Semesters
              </Button>
              
              {semesters.map(semester => (
                <Button
                  key={semester.id}
                  variant="outline"
                  className={selectedSemester === semester.id ? "w-full bg-primary/10" : "w-full"}
                  onClick={() => setSelectedSemester(semester.id)}
                >
                  {semester.semester_name} (SGPA: {semester.sgpa})
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={isAddingSemester} onOpenChange={setIsAddingSemester}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Semester
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Semester</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new semester.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semester-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="semester-name"
                      placeholder="e.g., Fall 2023"
                      className="col-span-3"
                      value={newSemester.name}
                      onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sgpa" className="text-right">
                      SGPA
                    </Label>
                    <Input
                      id="sgpa"
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      className="col-span-3"
                      value={newSemester.sgpa}
                      onChange={(e) => setNewSemester({ ...newSemester, sgpa: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingSemester(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSemester} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Semester'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                {selectedSemester 
                  ? `Courses for ${semesters.find(s => s.id === selectedSemester)?.semester_name}` 
                  : 'All courses across semesters'}
              </CardDescription>
            </div>
            <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
              <DialogTrigger asChild>
                <Button disabled={!selectedSemester}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new course.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course-name" className="text-right">
                      Course Name
                    </Label>
                    <Input
                      id="course-name"
                      placeholder="e.g., Data Structures"
                      className="col-span-3"
                      value={newCourse.course_name}
                      onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course-code" className="text-right">
                      Course Code
                    </Label>
                    <Input
                      id="course-code"
                      placeholder="e.g., CS101"
                      className="col-span-3"
                      value={newCourse.course_code}
                      onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="credits" className="text-right">
                      Credits
                    </Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      className="col-span-3"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grade" className="text-right">
                      Grade
                    </Label>
                    <Select 
                      value={newCourse.grade} 
                      onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="IP">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCourse} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Course'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No courses found. Add a course to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        {editingCourse === course.id ? (
                          <Input 
                            value={course.course_code} 
                            onChange={(e) => {
                              setSemesterCourses(prev => 
                                prev.map(c => c.id === course.id ? { ...c, course_code: e.target.value } : c)
                              );
                            }} 
                          />
                        ) : (
                          course.course_code
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCourse === course.id ? (
                          <Input 
                            value={course.course_name} 
                            onChange={(e) => {
                              setSemesterCourses(prev => 
                                prev.map(c => c.id === course.id ? { ...c, course_name: e.target.value } : c)
                              );
                            }} 
                          />
                        ) : (
                          course.course_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCourse === course.id ? (
                          <Input 
                            type="number"
                            min="1"
                            max="6"
                            value={course.credits} 
                            onChange={(e) => {
                              setSemesterCourses(prev => 
                                prev.map(c => c.id === course.id ? { ...c, credits: parseInt(e.target.value) } : c)
                              );
                            }} 
                          />
                        ) : (
                          course.credits
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCourse === course.id ? (
                          <Select 
                            value={course.grade} 
                            onValueChange={(value) => {
                              setSemesterCourses(prev => 
                                prev.map(c => c.id === course.id ? { ...c, grade: value } : c)
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                              <SelectItem value="IP">In Progress</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          course.grade
                        )}
                      </TableCell>
                      <TableCell>{course.semester_name}</TableCell>
                      <TableCell className="text-right">
                        {editingCourse === course.id ? (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleUpdateCourse(course.id, {
                              course_name: course.course_name,
                              course_code: course.course_code,
                              credits: course.credits,
                              grade: course.grade
                            })}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingCourse(course.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseTracker;
