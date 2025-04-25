
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash } from "lucide-react";

interface CoursesProps {
  courses: Tables<"courses">[];
  isEditMode: boolean;
  profileId: string;
  onCoursesChange: () => void;
}

export const Courses = ({ courses, isEditMode, profileId, onCoursesChange }: CoursesProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Tables<"courses"> | null>(null);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    credits: "",
    grade: ""
  });
  const { toast } = useToast();

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          name: newCourse.name,
          code: newCourse.code,
          credits: newCourse.credits ? parseInt(newCourse.credits) : null,
          grade: newCourse.grade || null,
          profile_id: profileId
        });

      if (error) throw error;
      
      setNewCourse({
        name: "",
        code: "",
        credits: "",
        grade: ""
      });
      setIsAdding(false);
      onCoursesChange();
      
      toast({
        title: "Course added",
        description: `${newCourse.code}: ${newCourse.name} has been added to your courses.`
      });
    } catch (error: any) {
      toast({
        title: "Error adding course",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          name: editingCourse.name,
          code: editingCourse.code,
          credits: editingCourse.credits,
          grade: editingCourse.grade
        })
        .eq('id', editingCourse.id);

      if (error) throw error;
      
      setEditingCourse(null);
      onCoursesChange();
      
      toast({
        title: "Course updated",
        description: `${editingCourse.code}: ${editingCourse.name} has been updated.`
      });
    } catch (error: any) {
      toast({
        title: "Error updating course",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      
      onCoursesChange();
      
      toast({
        title: "Course removed",
        description: `${courseName} has been removed from your courses.`
      });
    } catch (error: any) {
      toast({
        title: "Error removing course",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Relevant Coursework</h2>
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="border p-3 rounded-md">
              {editingCourse?.id === course.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editingCourse.name}
                      onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                      placeholder="Course name"
                    />
                    <Input
                      value={editingCourse.code}
                      onChange={(e) => setEditingCourse({...editingCourse, code: e.target.value})}
                      placeholder="Course code"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editingCourse.credits?.toString() || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseInt(value);
                        setEditingCourse({...editingCourse, credits: isNaN(numValue) ? null : numValue})
                      }}
                      placeholder="Credits"
                      type="number"
                    />
                    <Input
                      value={editingCourse.grade || ""}
                      onChange={(e) => setEditingCourse({...editingCourse, grade: e.target.value})}
                      placeholder="Grade"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleUpdateCourse}>Save</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCourse(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {course.grade || 'N/A'}
                    </span>
                    
                    {isEditMode && (
                      <div className="flex ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingCourse(course)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id, course.name)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isEditMode && !isAdding && (
            <Button 
              variant="outline" 
              className="h-full min-h-[80px] flex items-center justify-center"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={16} className="mr-1" /> Add Course
            </Button>
          )}
        </div>
        
        {isEditMode && isAdding && (
          <div className="mt-4 border p-4 rounded-md space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                placeholder="Course name"
              />
              <Input
                value={newCourse.code}
                onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                placeholder="Course code"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newCourse.credits}
                onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                placeholder="Credits"
                type="number"
              />
              <Input
                value={newCourse.grade}
                onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}
                placeholder="Grade"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleAddCourse}>Add Course</Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewCourse({
                    name: "",
                    code: "",
                    credits: "",
                    grade: ""
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
