import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndPersona();
  }, []);

  const checkAuthAndPersona = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: persona } = await supabase
        .from("ai_personas")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!persona) {
        navigate("/persona/demo");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking auth/persona:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
};

export default Index;
