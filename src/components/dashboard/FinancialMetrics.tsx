import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import { mockFinancialData } from "@/lib/dashboardMockData";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingDown, Zap, Clock } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

export const FinancialMetrics = () => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial & Cost Savings Dashboard</h2>
      
      {/* AI Cost KPIs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Costs</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="LLM Cost per Minute"
            value={`$${mockFinancialData.aiCosts.llmCostPerMinute}`}
            icon={Zap}
          />
          <KPICard
            title="Voice Cost per Minute"
            value={`$${mockFinancialData.aiCosts.voiceCostPerMinute}`}
            icon={Zap}
          />
          <KPICard
            title="Cost per Session (6 min)"
            value={`$${mockFinancialData.aiCosts.costPerSession}`}
            icon={DollarSign}
          />
          <KPICard
            title="Cost per User/Month"
            value={`$${mockFinancialData.aiCosts.costPerUserPerMonth}`}
            icon={DollarSign}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-1">
          <KPICard
            title="Total Monthly Cost (50 users)"
            value={formatCurrency(mockFinancialData.aiCosts.totalMonthlyCost)}
            icon={DollarSign}
            className="bg-primary/5"
          />
        </div>
      </div>

      {/* Savings KPIs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Savings vs Traditional Training</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Traditional Coaching Cost"
            value={formatCurrency(mockFinancialData.savings.traditionalCoachingCost)}
            subtitle="per session"
            icon={DollarSign}
          />
          <KPICard
            title="Savings per Session"
            value={formatCurrency(mockFinancialData.savings.savingsPerSession)}
            icon={TrendingDown}
            trend={{ value: mockFinancialData.savings.savingsPercentage, label: "reduction" }}
          />
          <KPICard
            title="Annual Savings"
            value={formatCurrency(mockFinancialData.savings.annualSavingsPerCompany)}
            icon={TrendingDown}
            className="bg-green-50 dark:bg-green-950"
          />
          <KPICard
            title="Time Saved/Month"
            value={`${mockFinancialData.savings.timesSavedPerMonth} hrs`}
            icon={Clock}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cost Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>AI Cost vs Traditional Coaching</CardTitle>
            <CardDescription>Per session comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockFinancialData.costVsTraditional}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="type" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => `$${value}`}
                />
                <Bar dataKey="cost" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 12-Month Savings Projection */}
        <Card>
          <CardHeader>
            <CardTitle>12-Month Savings Projection</CardTitle>
            <CardDescription>Cumulative savings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockFinancialData.projectedSavings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Line type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Monthly cost distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockFinancialData.costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {mockFinancialData.costBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value, name, props: any) => [`$${props.payload.amount}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Costs & Savings */}
        <Card>
          <CardHeader>
            <CardTitle>Cost & Savings by Department</CardTitle>
            <CardDescription>Monthly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">Monthly Cost</TableHead>
                  <TableHead className="text-right">Annual Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFinancialData.departmentCosts.map((dept) => (
                  <TableRow key={dept.department}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell className="text-right">{dept.users}</TableCell>
                    <TableCell className="text-right">${dept.monthlyCost}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {formatCurrency(dept.savings)}
                    </TableCell>
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
