
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface ProjectsProps {
  projects: Tables<"projects">[];
}

export const Projects = ({ projects }: ProjectsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Projects</h2>
      <Card className="p-4">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id}>
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              <p className="text-gray-600">
                Status: {project.status} • 
                {project.status === "Completed" 
                  ? ` Completed: ${project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}`
                  : ` Due: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}`
                }
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
