
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SummaryProps {
  bio: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isEditMode: boolean;
  profileId: string;
  onProfileUpdate: () => void;
}

export const Summary = ({ 
  bio, 
  email, 
  phone, 
  address, 
  isEditMode,
  profileId,
  onProfileUpdate
}: SummaryProps) => {
  const [editedBio, setEditedBio] = useState(bio || "");
  const [editedEmail, setEditedEmail] = useState(email || "");
  const [editedPhone, setEditedPhone] = useState(phone || "");
  const [editedAddress, setEditedAddress] = useState(address || "");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSaveSummary = async () => {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({
          bio: editedBio || null,
          email: editedEmail || null,
          phone: editedPhone || null,
          address: editedAddress || null
        })
        .eq('id', profileId);

      if (error) throw error;
      
      setIsEditing(false);
      onProfileUpdate();
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="p-8">
        {isEditMode && isEditing ? (
          <>
            <div className="border-b pb-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xl font-semibold text-gray-800 mb-3">Professional Summary</label>
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Write a brief professional summary"
                className="min-h-[150px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveSummary}>Save</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedBio(bio || "");
                  setEditedEmail(email || "");
                  setEditedPhone(phone || "");
                  setEditedAddress(address || "");
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="border-b pb-6 mb-6">
              <div className="mt-2 text-gray-600 space-y-1">
                <p>{email || ""}</p>
                <p>{phone || ""}</p>
                <p>{address || ""}</p>
              </div>
              
              {isEditMode && !isEditing && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Contact Info
                </Button>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Professional Summary</h2>
              <p className="text-gray-600 leading-relaxed">{bio || ""}</p>
              
              {isEditMode && !isEditing && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Summary
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    </>
  );
};
