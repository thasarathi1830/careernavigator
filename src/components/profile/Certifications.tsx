
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash } from "lucide-react";

interface CertificationsProps {
  certifications: Tables<"certifications">[];
  isEditMode: boolean;
  profileId: string;
  onCertificationsChange: () => void;
}

export const Certifications = ({ 
  certifications, 
  isEditMode, 
  profileId, 
  onCertificationsChange 
}: CertificationsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Tables<"certifications"> | null>(null);
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    issue_date: "",
    expiry_date: ""
  });
  const { toast } = useToast();

  const handleAddCertification = async () => {
    if (!newCertification.name || !newCertification.issuer || !newCertification.issue_date) return;
    
    try {
      const { error } = await supabase
        .from('certifications')
        .insert({
          name: newCertification.name,
          issuer: newCertification.issuer,
          issue_date: newCertification.issue_date,
          expiry_date: newCertification.expiry_date || null,
          profile_id: profileId
        });

      if (error) throw error;
      
      setNewCertification({
        name: "",
        issuer: "",
        issue_date: "",
        expiry_date: ""
      });
      setIsAdding(false);
      onCertificationsChange();
      
      toast({
        title: "Certification added",
        description: `${newCertification.name} has been added to your certifications.`
      });
    } catch (error: any) {
      toast({
        title: "Error adding certification",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateCertification = async () => {
    if (!editingCertification) return;
    
    try {
      const { error } = await supabase
        .from('certifications')
        .update({
          name: editingCertification.name,
          issuer: editingCertification.issuer,
          issue_date: editingCertification.issue_date,
          expiry_date: editingCertification.expiry_date
        })
        .eq('id', editingCertification.id);

      if (error) throw error;
      
      setEditingCertification(null);
      onCertificationsChange();
      
      toast({
        title: "Certification updated",
        description: `${editingCertification.name} has been updated.`
      });
    } catch (error: any) {
      toast({
        title: "Error updating certification",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCertification = async (certId: string, certName: string) => {
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', certId);

      if (error) throw error;
      
      onCertificationsChange();
      
      toast({
        title: "Certification removed",
        description: `${certName} has been removed from your certifications.`
      });
    } catch (error: any) {
      toast({
        title: "Error removing certification",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Certifications</h2>
      <Card className="p-4">
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              {editingCertification?.id === cert.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingCertification.name}
                    onChange={(e) => setEditingCertification({...editingCertification, name: e.target.value})}
                    placeholder="Certification name"
                  />
                  <Input
                    value={editingCertification.issuer}
                    onChange={(e) => setEditingCertification({...editingCertification, issuer: e.target.value})}
                    placeholder="Issuing organization"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Issue Date</label>
                      <Input
                        type="date"
                        value={editingCertification.issue_date}
                        onChange={(e) => setEditingCertification({...editingCertification, issue_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Expiry Date (Optional)</label>
                      <Input
                        type="date"
                        value={editingCertification.expiry_date || ""}
                        onChange={(e) => setEditingCertification({...editingCertification, expiry_date: e.target.value || null})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleUpdateCertification}>Save</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCertification(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-gray-600">
                        {cert.issuer} • Issued: {cert.issue_date}
                        {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                      </p>
                    </div>
                    
                    {isEditMode && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingCertification(cert)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCertification(cert.id, cert.name)}
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
              <Plus size={16} className="mr-1" /> Add New Certification
            </Button>
          )}

          {isEditMode && isAdding && (
            <div className="border p-3 rounded-md space-y-3">
              <Input
                value={newCertification.name}
                onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                placeholder="Certification name"
              />
              <Input
                value={newCertification.issuer}
                onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                placeholder="Issuing organization"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Issue Date</label>
                  <Input
                    type="date"
                    value={newCertification.issue_date}
                    onChange={(e) => setNewCertification({...newCertification, issue_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Expiry Date (Optional)</label>
                  <Input
                    type="date"
                    value={newCertification.expiry_date}
                    onChange={(e) => setNewCertification({...newCertification, expiry_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleAddCertification}>Add Certification</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewCertification({
                      name: "",
                      issuer: "",
                      issue_date: "",
                      expiry_date: ""
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
