
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  icon,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {icon && <div className="text-education-primary">{icon}</div>}
        </div>
        <div>{children}</div>
      </div>
    </Card>
  );
}

export default DashboardCard;
