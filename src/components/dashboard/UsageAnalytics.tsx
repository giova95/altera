import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import { mockUsageData } from "@/lib/dashboardMockData";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Activity, Clock, TrendingUp } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))'];

export const UsageAnalytics = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Analytics</h2>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Sessions"
          value={mockUsageData.kpis.totalSessions.toLocaleString()}
          icon={Activity}
          trend={{ value: 23, label: "from last month" }}
        />
        <KPICard
          title="Active Users (MAU)"
          value={mockUsageData.kpis.activeUsers.mau}
          subtitle={`DAU: ${mockUsageData.kpis.activeUsers.dau} | WAU: ${mockUsageData.kpis.activeUsers.wau}`}
          icon={Users}
        />
        <KPICard
          title="Avg Session Duration"
          value={`${mockUsageData.kpis.avgSessionDuration} min`}
          icon={Clock}
        />
        <KPICard
          title="Sessions per User"
          value={mockUsageData.kpis.sessionsPerUser}
          icon={TrendingUp}
          trend={{ value: 15, label: "from last month" }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sessions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions Over Time</CardTitle>
            <CardDescription>Monthly session trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockUsageData.sessionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions by Department</CardTitle>
            <CardDescription>Distribution across teams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockUsageData.sessionsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="department" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scenario Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Scenario Distribution</CardTitle>
            <CardDescription>Most practiced scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockUsageData.scenarioDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ scenario, value }) => `${scenario}: ${value}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {mockUsageData.scenarioDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
