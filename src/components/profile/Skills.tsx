
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface SkillsProps {
  skills: Tables<"skills">[];
}

export const Skills = ({ skills }: SkillsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
