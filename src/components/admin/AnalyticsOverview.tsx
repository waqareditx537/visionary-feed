import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Activity, Clock, Zap } from "lucide-react";

interface AnalyticsData {
  metric_name: string;
  metric_value: number;
  date: string;
}

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from("app_analytics")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    if (!error && data) {
      setAnalytics(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No analytics data yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Analytics will appear here as users interact with the app
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.slice(0, 6).map((item) => (
                <div key={`${item.metric_name}-${item.date}`} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{item.metric_name.replace(/_/g, " ")}</p>
                      <p className="text-2xl font-bold">{item.metric_value.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-primary/30" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">Total Metrics Tracked</p>
              <p className="text-3xl font-bold">{analytics.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-3xl font-bold text-green-500">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
