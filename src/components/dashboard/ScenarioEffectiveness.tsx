import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import { mockScenarioData } from "@/lib/dashboardMockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Users2, AlertTriangle, TrendingUp, XCircle } from "lucide-react";

export const ScenarioEffectiveness = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Scenario Effectiveness (P2-P6)</h2>
      
      {/* P2: Conflict Resolution */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          P2: Conflict Resolution
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <KPICard
            title="Conflict Resolution Score"
            value={`${mockScenarioData.conflictResolution.score}%`}
            icon={MessageSquare}
            trend={{ value: 8, label: "improvement" }}
          />
          <KPICard
            title="Emotional Regulation Index"
            value={`${mockScenarioData.conflictResolution.emotionalRegulation}%`}
            icon={MessageSquare}
          />
        </div>
      </div>

      {/* P3: Delicate Request */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          P3: Asking Manager Something Delicate
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <KPICard
            title="Persuasiveness Score"
            value={`${mockScenarioData.delicateRequest.persuasiveness}%`}
            icon={Users2}
          />
          <KPICard
            title="Politeness Index"
            value={`${mockScenarioData.delicateRequest.politeness}%`}
            icon={Users2}
            trend={{ value: 5, label: "improvement" }}
          />
        </div>
      </div>

      {/* P4: Warning Worker */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          P4: Warning a Worker
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <KPICard
            title="Tone Appropriateness"
            value={`${mockScenarioData.warningWorker.toneAppropriateness}%`}
            icon={AlertTriangle}
          />
          <KPICard
            title="Feedback Quality"
            value={`${mockScenarioData.warningWorker.feedbackQuality}%`}
            icon={AlertTriangle}
            trend={{ value: 12, label: "improvement" }}
          />
        </div>
      </div>

      {/* P5: Reporting Upward */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          P5: Reporting Upward
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Clarity"
            value={`${mockScenarioData.reportingUpward.clarity}%`}
            icon={TrendingUp}
          />
          <KPICard
            title="Conciseness"
            value={`${mockScenarioData.reportingUpward.conciseness}%`}
            icon={TrendingUp}
          />
          <KPICard
            title="Data Structuring Ability"
            value={`${mockScenarioData.reportingUpward.dataStructuring}%`}
            icon={TrendingUp}
            trend={{ value: 10, label: "improvement" }}
          />
        </div>
      </div>

      {/* P6: Firing Simulation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          P6: Firing Simulation
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <KPICard
            title="Sensitivity Score"
            value={`${mockScenarioData.firingSimulation.sensitivity}%`}
            icon={XCircle}
          />
          <KPICard
            title="Legal Safety Score"
            value={`${mockScenarioData.firingSimulation.legalSafety}%`}
            icon={XCircle}
            trend={{ value: 6, label: "improvement" }}
          />
        </div>
      </div>

      {/* Performance Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Performance Heatmap</CardTitle>
          <CardDescription>Individual performance across all scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">P2: Conflict</TableHead>
                <TableHead className="text-right">P3: Delicate</TableHead>
                <TableHead className="text-right">P4: Warning</TableHead>
                <TableHead className="text-right">P5: Reporting</TableHead>
                <TableHead className="text-right">P6: Firing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockScenarioData.performanceHeatmap.map((user) => (
                <TableRow key={user.user}>
                  <TableCell className="font-medium">{user.user}</TableCell>
                  <TableCell className="text-right">
                    <span className={user.p2 >= 80 ? "text-green-600" : user.p2 >= 70 ? "text-yellow-600" : "text-red-600"}>
                      {user.p2}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={user.p3 >= 80 ? "text-green-600" : user.p3 >= 70 ? "text-yellow-600" : "text-red-600"}>
                      {user.p3}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={user.p4 >= 80 ? "text-green-600" : user.p4 >= 70 ? "text-yellow-600" : "text-red-600"}>
                      {user.p4}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={user.p5 >= 80 ? "text-green-600" : user.p5 >= 70 ? "text-yellow-600" : "text-red-600"}>
                      {user.p5}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={user.p6 >= 80 ? "text-green-600" : user.p6 >= 70 ? "text-yellow-600" : "text-red-600"}>
                      {user.p6}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
