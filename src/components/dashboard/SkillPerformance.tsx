import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import { mockSkillData } from "@/lib/dashboardMockData";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target } from "lucide-react";

export const SkillPerformance = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Skill Performance</h2>
      
      {/* Aggregate Skills KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        {mockSkillData.aggregateSkills.map((skill) => (
          <KPICard
            key={skill.skill}
            title={skill.skill}
            value={`${skill.value}%`}
            icon={Target}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Aggregate Skills Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Skill Profile</CardTitle>
            <CardDescription>Aggregate skill performance across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={mockSkillData.aggregateSkills}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" stroke="hsl(var(--foreground))" />
                <PolarRadiusAxis stroke="hsl(var(--foreground))" />
                <Radar name="Skills" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Trends Over Time</CardTitle>
            <CardDescription>Monthly skill development</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Line type="monotone" data={mockSkillData.skillTrendsOverTime.confidence} dataKey="value" name="Confidence" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" data={mockSkillData.skillTrendsOverTime.clarity} dataKey="value" name="Clarity" stroke="hsl(var(--secondary))" strokeWidth={2} />
                <Line type="monotone" data={mockSkillData.skillTrendsOverTime.empathy} dataKey="value" name="Empathy" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Comparison */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Team Skills Comparison</CardTitle>
            <CardDescription>Skill performance by department</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                  <TableHead className="text-right">Clarity</TableHead>
                  <TableHead className="text-right">Empathy</TableHead>
                  <TableHead className="text-right">Assertiveness</TableHead>
                  <TableHead className="text-right">Stress Mgmt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSkillData.teamComparison.map((team) => (
                  <TableRow key={team.team}>
                    <TableCell className="font-medium">{team.team}</TableCell>
                    <TableCell className="text-right">{team.confidence}%</TableCell>
                    <TableCell className="text-right">{team.clarity}%</TableCell>
                    <TableCell className="text-right">{team.empathy}%</TableCell>
                    <TableCell className="text-right">{team.assertiveness}%</TableCell>
                    <TableCell className="text-right">{team.stress}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
