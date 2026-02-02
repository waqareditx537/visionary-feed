import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export function SettingsManager() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .order("key");

    if (!error && data) {
      setSettings(data);
      const settingsMap: Record<string, string> = {};
      data.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      setLocalSettings(settingsMap);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    for (const setting of settings) {
      if (localSettings[setting.key] !== setting.value) {
        await supabase
          .from("app_settings")
          .update({ value: localSettings[setting.key] })
          .eq("id", setting.id);
      }
    }

    toast({ title: "Settings saved successfully" });
    fetchSettings();
    setSaving(false);
  };

  const updateSetting = (key: string, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>App Settings</CardTitle>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* App Name */}
          <div className="space-y-2">
            <Label>App Name</Label>
            <Input
              value={localSettings["app_name"] || ""}
              onChange={(e) => updateSetting("app_name", e.target.value)}
              placeholder="Application name"
            />
            <p className="text-xs text-muted-foreground">The name displayed in the header</p>
          </div>

          {/* Items Per Page */}
          <div className="space-y-2">
            <Label>Items Per Page</Label>
            <Input
              type="number"
              value={localSettings["items_per_page"] || "20"}
              onChange={(e) => updateSetting("items_per_page", e.target.value)}
              placeholder="20"
            />
            <p className="text-xs text-muted-foreground">Number of media items to load per page</p>
          </div>

          {/* Enable Downloads */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Downloads</Label>
              <p className="text-xs text-muted-foreground">Allow users to download media</p>
            </div>
            <Switch
              checked={localSettings["enable_downloads"] === "true"}
              onCheckedChange={(checked) => updateSetting("enable_downloads", checked.toString())}
            />
          </div>

          {/* Enable Ads */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Google Ads</Label>
              <p className="text-xs text-muted-foreground">Display ads in the application</p>
            </div>
            <Switch
              checked={localSettings["enable_ads"] === "true"}
              onCheckedChange={(checked) => updateSetting("enable_ads", checked.toString())}
            />
          </div>

          {/* Add Custom Setting */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-4">All Settings</p>
            <div className="space-y-3">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{setting.key}</p>
                    <p className="text-xs text-muted-foreground">{setting.description || "No description"}</p>
                  </div>
                  <Input
                    className="w-48"
                    value={localSettings[setting.key] || ""}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
