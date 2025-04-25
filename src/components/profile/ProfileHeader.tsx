
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  name: string;
  studentId: string;
  isEditMode: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
}

export const ProfileHeader = ({
  name,
  studentId,
  isEditMode,
  onEditClick,
  onSaveClick,
}: ProfileHeaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const { data } = await supabase.auth.getUser();
      const filePath = `${data.user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 group">
        <Avatar className="h-32 w-32">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className="text-3xl bg-education-primary text-white">
            {name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        {isEditMode && (
          <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={isUploading}
            />
            <span className="text-white text-sm">
              {isUploading ? "Uploading..." : "Change Photo"}
            </span>
          </label>
        )}
      </div>
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-500 text-sm mb-4">{studentId}</p>
      <Button
        className="w-full mb-3"
        onClick={() => isEditMode ? onSaveClick() : onEditClick()}
      >
        {isEditMode ? "Save Profile" : "Edit Profile"}
      </Button>
    </div>
  );
};
