import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTeamProgress } from "@/lib/dashboardMockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TeamProgress = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team & User Progress</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Improvers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Improvers
            </CardTitle>
            <CardDescription>Users showing greatest improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Improvement</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTeamProgress.topImprovers.map((user) => (
                  <TableRow key={user.name}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {user.improvement}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{user.currentScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users Needing Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Users Who Need Support
            </CardTitle>
            <CardDescription>Lower performers requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTeamProgress.needsSupport.map((user) => (
                  <TableRow key={user.name}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        {user.score}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{user.sessions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Skill Growth Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overall Skill Growth</CardTitle>
            <CardDescription>Average skill score trend across organization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTeamProgress.skillGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Line type="monotone" dataKey="avgScore" name="Average Score" stroke="hsl(var(--primary))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
