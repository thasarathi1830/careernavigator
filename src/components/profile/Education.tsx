
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EducationProps {
  major: string | null;
  year: string | null;
  gpa: string | null;
  university: string | null; // Added university field
  isEditMode: boolean;
  profileId: string;
  onProfileUpdate: () => void;
}

export const Education = ({ 
  major, 
  year, 
  gpa,
  university, // Add university to props
  isEditMode,
  profileId,
  onProfileUpdate
}: EducationProps) => {
  const [editedMajor, setEditedMajor] = useState(major || "");
  const [editedYear, setEditedYear] = useState(year || "");
  const [editedGpa, setEditedGpa] = useState(gpa || "");
  const [editedUniversity, setEditedUniversity] = useState(university || ""); // Add state for university
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Update local state whenever props change
  useEffect(() => {
    setEditedMajor(major || "");
    setEditedYear(year || "");
    setEditedGpa(gpa || "");
    setEditedUniversity(university || ""); // Update university state when props change
  }, [major, year, gpa, university]);

  const handleSaveEducation = async () => {
    try {
      console.log("Saving education with university:", editedUniversity);
      
      const { error } = await supabase
        .from('student_profiles')
        .update({
          major: editedMajor || null,
          year: editedYear || null,
          gpa: editedGpa || null,
          university: editedUniversity || null // Add university to update
        })
        .eq('id', profileId);

      if (error) throw error;
      
      setIsEditing(false);
      
      // Call this to refresh parent component data
      onProfileUpdate();
      
      toast({
        title: "Education updated",
        description: "Your education details have been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating education:", error);
      toast({
        title: "Error updating education",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Education</h2>
      <Card className="p-4">
        {isEditMode && isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">University</label>
              <Input
                value={editedUniversity}
                onChange={(e) => setEditedUniversity(e.target.value)}
                placeholder="Enter your university"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Major</label>
              <Input
                value={editedMajor}
                onChange={(e) => setEditedMajor(e.target.value)}
                placeholder="Enter your major"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <Input
                value={editedYear}
                onChange={(e) => setEditedYear(e.target.value)}
                placeholder="Enter your year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CGPA</label>
              <Input
                value={editedGpa}
                onChange={(e) => setEditedGpa(e.target.value)}
                placeholder="Enter your GPA"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveEducation}>Save</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedMajor(major || "");
                  setEditedYear(year || "");
                  setEditedGpa(gpa || "");
                  setEditedUniversity(university || ""); // Reset university when cancelling
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">{university || "University Name"}</h3>
              <p className="text-gray-600">{major || "Not specified"} • {year || "Not specified"} Year</p>
              <p className="text-gray-600">CGPA: {gpa || "Not specified"}</p>
              
              {isEditMode && !isEditing && (
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Education
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
