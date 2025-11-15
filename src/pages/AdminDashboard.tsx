import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, BarChart3 } from "lucide-react";
import { UsageAnalytics } from "@/components/dashboard/UsageAnalytics";
import { SkillPerformance } from "@/components/dashboard/SkillPerformance";
import { ScenarioEffectiveness } from "@/components/dashboard/ScenarioEffectiveness";
import { TeamProgress } from "@/components/dashboard/TeamProgress";
import { FinancialMetrics } from "@/components/dashboard/FinancialMetrics";
import { CompliancePanel } from "@/components/dashboard/CompliancePanel";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Load profile to check role
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Check if user has admin or HR role
      if (profileData?.user_role !== 'admin' && profileData?.user_role !== 'hr') {
        toast.error("Access denied. This page is for admin and HR users only.");
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Error checking access:", error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name || user?.email} - {profile?.user_role?.toUpperCase()}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <UsageAnalytics />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillPerformance />
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <ScenarioEffectiveness />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamProgress />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialMetrics />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <CompliancePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
