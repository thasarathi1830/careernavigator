
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash } from "lucide-react";
import { format } from "date-fns";

interface ProjectsProps {
  projects: Tables<"projects">[];
  isEditMode: boolean;
  profileId: string;
  onProjectsChange: () => void;
}

export const Projects = ({ projects, isEditMode, profileId, onProjectsChange }: ProjectsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<Tables<"projects"> | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    status: "In Progress",
    deadline: "",
    completion_date: ""
  });
  const { toast } = useToast();

  const handleAddProject = async () => {
    if (!newProject.name) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          status: newProject.status,
          deadline: newProject.deadline || null,
          completion_date: newProject.completion_date || null,
          profile_id: profileId
        });

      if (error) throw error;
      
      setNewProject({
        name: "",
        status: "In Progress",
        deadline: "",
        completion_date: ""
      });
      setIsAdding(false);
      onProjectsChange();
      
      toast({
        title: "Project added",
        description: `${newProject.name} has been added to your projects.`
      });
    } catch (error: any) {
      toast({
        title: "Error adding project",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name,
          status: editingProject.status,
          deadline: editingProject.deadline,
          completion_date: editingProject.completion_date
        })
        .eq('id', editingProject.id);

      if (error) throw error;
      
      setEditingProject(null);
      onProjectsChange();
      
      toast({
        title: "Project updated",
        description: `${editingProject.name} has been updated.`
      });
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      onProjectsChange();
      
      toast({
        title: "Project removed",
        description: `${projectName} has been removed from your projects.`
      });
    } catch (error: any) {
      toast({
        title: "Error removing project",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Projects</h2>
      <Card className="p-4">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              {editingProject?.id === project.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                    placeholder="Project name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Status</label>
                      <Select
                        value={editingProject.status}
                        onValueChange={(value) => setEditingProject({...editingProject, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Canceled">Canceled</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {editingProject.status === "Completed" ? (
                      <div>
                        <label className="block text-sm mb-1">Completion Date</label>
                        <Input
                          type="date"
                          value={editingProject.completion_date || ""}
                          onChange={(e) => setEditingProject({...editingProject, completion_date: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm mb-1">Deadline</label>
                        <Input
                          type="date"
                          value={editingProject.deadline || ""}
                          onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleUpdateProject}>Save</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingProject(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-gray-600">
                        Status: {project.status} • 
                        {project.status === "Completed" 
                          ? ` Completed: ${formatDate(project.completion_date)}`
                          : ` Due: ${formatDate(project.deadline)}`
                        }
                      </p>
                    </div>
                    
                    {isEditMode && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProject(project.id, project.name)}
                        >
                          <Trash size={16} />
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
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={16} className="mr-1" /> Add New Project
            </Button>
          )}
          
          {isEditMode && isAdding && (
            <div className="border p-3 rounded-md space-y-3">
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Project name"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <Select
                    value={newProject.status}
                    onValueChange={(value) => setNewProject({...newProject, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Canceled">Canceled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {newProject.status === "Completed" ? (
                  <div>
                    <label className="block text-sm mb-1">Completion Date</label>
                    <Input
                      type="date"
                      value={newProject.completion_date}
                      onChange={(e) => setNewProject({...newProject, completion_date: e.target.value})}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm mb-1">Deadline</label>
                    <Input
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleAddProject}>Add Project</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewProject({
                      name: "",
                      status: "In Progress",
                      deadline: "",
                      completion_date: ""
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
