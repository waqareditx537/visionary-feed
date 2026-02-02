import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysManager } from "@/components/admin/ApiKeysManager";
import { NotificationsManager } from "@/components/admin/NotificationsManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { 
  LayoutDashboard, 
  Key, 
  Bell, 
  Settings, 
  LogOut,
  Users,
  Download,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const { admin, logout, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalViews: 0,
    activeUsers: 0,
    apiCalls: 0,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("app_analytics")
        .select("metric_name, metric_value")
        .order("date", { ascending: false })
        .limit(10);

      if (data) {
        const downloads = data.find(d => d.metric_name === "downloads")?.metric_value || 0;
        const views = data.find(d => d.metric_name === "views")?.metric_value || 0;
        const users = data.find(d => d.metric_name === "users")?.metric_value || 0;
        const api = data.find(d => d.metric_name === "api_calls")?.metric_value || 0;
        setStats({ totalDownloads: downloads, totalViews: views, activeUsers: users, apiCalls: api });
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-white font-bold">D</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Downterest Admin</h1>
              <p className="text-xs text-muted-foreground">Welcome, {admin?.name || admin?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Eye className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Key className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.apiCalls}</p>
                  <p className="text-xs text-muted-foreground">API Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysManager />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsManager />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
