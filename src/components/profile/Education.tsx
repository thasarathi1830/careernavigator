
import { Card } from "@/components/ui/card";

interface EducationProps {
  major: string | null;
  year: string | null;
  gpa: string | null;
}

export const Education = ({ major, year, gpa }: EducationProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Education</h2>
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">University Name</h3>
            <p className="text-gray-600">{major || "Not specified"} • {year || "Not specified"} Year</p>
            <p className="text-gray-600">CGPA: {gpa || "Not specified"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
