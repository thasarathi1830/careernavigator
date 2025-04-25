
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface CertificationsProps {
  certifications: Tables<"certifications">[];
}

export const Certifications = ({ certifications }: CertificationsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Certifications</h2>
      <Card className="p-4">
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id}>
              <h3 className="font-medium text-gray-900">{cert.name}</h3>
              <p className="text-gray-600">
                {cert.issuer} • Issued: {cert.issue_date}
                {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
