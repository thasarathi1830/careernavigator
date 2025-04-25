
import { Card } from "@/components/ui/card";

interface SummaryProps {
  bio: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export const Summary = ({ bio, email, phone, address }: SummaryProps) => {
  return (
    <>
      <Card className="p-8">
        <div className="border-b pb-6 mb-6">
          <div className="mt-2 text-gray-600 space-y-1">
            <p>{email || ""}</p>
            <p>{phone || ""}</p>
            <p>{address || ""}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Professional Summary</h2>
          <p className="text-gray-600 leading-relaxed">{bio || ""}</p>
        </div>
      </Card>
    </>
  );
};
