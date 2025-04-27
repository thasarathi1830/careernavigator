
import { useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Semester } from "@/types/SemesterCourses";

interface CGPAPerformanceGraphProps {
  semesters: Semester[];
}

export function CGPAPerformanceGraph({ semesters }: CGPAPerformanceGraphProps) {
  const chartData = useMemo(() => {
    return [...semesters]
      .sort((a, b) => a.semester_name.localeCompare(b.semester_name))
      .map(semester => ({
        name: semester.semester_name,
        sgpa: semester.sgpa,
      }));
  }, [semesters]);

  const averageCGPA = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.sgpa, 0);
    return sum / chartData.length;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CGPA Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No semester data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CGPA Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                domain={[0, 10]} 
                ticks={[0, 2, 4, 6, 8, 10]} 
              />
              <Tooltip 
                formatter={(value) => [`${value}`, 'SGPA']}
                labelFormatter={(label) => `Semester: ${label}`}
              />
              <Legend />
              <ReferenceLine 
                y={averageCGPA} 
                stroke="#ff7300" 
                strokeDasharray="3 3" 
                label={{ 
                  value: `CGPA: ${averageCGPA.toFixed(2)}`, 
                  position: 'right',
                  fill: '#ff7300',
                  fontSize: 12
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="sgpa" 
                name="SGPA" 
                stroke="#3A55A2" 
                strokeWidth={2} 
                activeDot={{ r: 8 }} 
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
