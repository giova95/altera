import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import { mockComplianceData } from "@/lib/dashboardMockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, Star, Zap } from "lucide-react";

export const CompliancePanel = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance & AI Quality</h2>
      
      {/* Quality Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Quality Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Transcription Accuracy"
            value={`${mockComplianceData.qualityMetrics.transcriptionAccuracy}%`}
            icon={CheckCircle2}
          />
          <KPICard
            title="Sentiment Accuracy"
            value={`${mockComplianceData.qualityMetrics.sentimentAccuracy}%`}
            icon={CheckCircle2}
          />
          <KPICard
            title="Response Relevance"
            value={`${mockComplianceData.qualityMetrics.responseRelevance}%`}
            icon={CheckCircle2}
          />
          <KPICard
            title="Average Latency"
            value={`${mockComplianceData.qualityMetrics.averageLatency}s`}
            icon={Zap}
          />
        </div>
      </div>

      {/* Compliance Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Status
          </CardTitle>
          <CardDescription>Regular compliance and security checks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compliance Check</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockComplianceData.complianceChecks.map((check) => (
                <TableRow key={check.check}>
                  <TableCell className="font-medium">{check.check}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="text-green-600 border-green-600"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {check.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(check.lastChecked).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Feedback */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Average User Rating"
          value={`${mockComplianceData.userFeedback.averageRating}/5`}
          icon={Star}
          subtitle={`Based on ${mockComplianceData.userFeedback.totalResponses} responses`}
        />
        <KPICard
          title="Total Responses"
          value={mockComplianceData.userFeedback.totalResponses}
          icon={Star}
        />
        <KPICard
          title="Recommendation Rate"
          value={`${mockComplianceData.userFeedback.recommendationRate}%`}
          icon={Star}
          trend={{ value: 12, label: "from last quarter" }}
        />
      </div>
    </div>
  );
};
