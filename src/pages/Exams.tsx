
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { Check, Edit, Save, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Assignment {
  id: string;
  name: string;
  course: string;
  type: string;
  due_date: string;
  status: string;
  completed: boolean;
  isEditing?: boolean;
}

const Exams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [tempAssignment, setTempAssignment] = useState<Assignment | null>(null);
  
  const [newAssignment, setNewAssignment] = useState({
    name: "",
    course: "",
    type: "Assignment",
    due_date: new Date().toISOString().split('T')[0],
    status: "Upcoming",
    completed: false
  });
  
  // Fetch assignments from database
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('profile_id', user.id)
          .order('due_date', { ascending: true });
          
        if (error) throw error;
        
        setAssignments(data || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:assignments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignments',
          filter: `profile_id=eq.${user?.id}` 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            setAssignments(prev => [...prev, payload.new as Assignment]);
          } else if (payload.eventType === 'UPDATE') {
            setAssignments(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new as Assignment : item)
            );
          } else if (payload.eventType === 'DELETE') {
            setAssignments(prev => 
              prev.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  const handleAddAssignment = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          profile_id: user.id,
          name: newAssignment.name,
          course: newAssignment.course,
          type: newAssignment.type,
          due_date: newAssignment.due_date,
          status: newAssignment.status,
          completed: newAssignment.completed
        });
        
      if (error) throw error;
      
      setNewAssignment({
        name: "",
        course: "",
        type: "Assignment",
        due_date: new Date().toISOString().split('T')[0],
        status: "Upcoming",
        completed: false
      });
      
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Assignment added successfully",
      });
    } catch (error) {
      console.error("Error adding assignment:", error);
      toast({
        title: "Error",
        description: "Failed to add assignment",
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({ ...newAssignment, [name]: value });
  };
  
  const handleSelectChange = (name, value) => {
    setNewAssignment({ ...newAssignment, [name]: value });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Submitted":
        return "bg-green-100 text-green-800";
      case "Graded":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ 
          completed: !completed,
          status: !completed ? 'Completed' : 'In Progress'
        })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    }
  };
  
  const startEditing = (assignment: Assignment) => {
    setEditingRow(assignment.id);
    setTempAssignment({...assignment});
  };
  
  const cancelEditing = () => {
    setEditingRow(null);
    setTempAssignment(null);
  };
  
  const saveEditing = async () => {
    if (!tempAssignment) return;
    
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          name: tempAssignment.name,
          course: tempAssignment.course,
          type: tempAssignment.type,
          due_date: tempAssignment.due_date,
          status: tempAssignment.status,
        })
        .eq('id', tempAssignment.id);
        
      if (error) throw error;
      
      setEditingRow(null);
      setTempAssignment(null);
      
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };
  
  const handleTempChange = (field: string, value: any) => {
    if (!tempAssignment) return;
    
    setTempAssignment({
      ...tempAssignment,
      [field]: value
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exams & Assignments</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-education-primary hover:bg-education-primary/90">
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment or Exam</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newAssignment.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  Course
                </Label>
                <Input
                  id="course"
                  name="course"
                  value={newAssignment.course}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newAssignment.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  name="due_date"
                  type="date"
                  value={newAssignment.due_date}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newAssignment.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Graded">Graded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAssignment}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              Loading assignments...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No assignments found. Add a new assignment to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className={cn("font-medium", assignment.completed && "line-through opacity-70")}>
                        {editingRow === assignment.id ? (
                          <Input
                            value={tempAssignment?.name || ''}
                            onChange={(e) => handleTempChange("name", e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          assignment.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === assignment.id ? (
                          <Input
                            value={tempAssignment?.course || ''}
                            onChange={(e) => handleTempChange("course", e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          assignment.course
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === assignment.id ? (
                          <Select
                            value={tempAssignment?.type || ''}
                            onValueChange={(value) => handleTempChange("type", value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Assignment">Assignment</SelectItem>
                              <SelectItem value="Exam">Exam</SelectItem>
                              <SelectItem value="Quiz">Quiz</SelectItem>
                              <SelectItem value="Project">Project</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          assignment.type
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === assignment.id ? (
                          <Input
                            type="date"
                            value={tempAssignment?.due_date || ''}
                            onChange={(e) => handleTempChange("due_date", e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          new Date(assignment.due_date).toLocaleDateString()
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === assignment.id ? (
                          <Select
                            value={tempAssignment?.status || ''}
                            onValueChange={(value) => handleTempChange("status", value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upcoming">Upcoming</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                              <SelectItem value="Graded">Graded</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingRow === assignment.id ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={saveEditing}
                                title="Save changes"
                              >
                                <Save className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={cancelEditing}
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
                                onClick={() => handleToggleComplete(assignment.id, assignment.completed)}
                                title={assignment.completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                <Check className={cn("h-4 w-4", assignment.completed ? "text-green-500" : "text-gray-500")} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => startEditing(assignment)}
                                title="Edit assignment"
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                title="Delete assignment"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Exams;
