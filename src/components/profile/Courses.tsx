
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface CoursesProps {
  courses: Tables<"courses">[];
}

export const Courses = ({ courses }: CoursesProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Relevant Coursework</h2>
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-600">{course.code}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {course.grade || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
