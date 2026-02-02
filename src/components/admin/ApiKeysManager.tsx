import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiKey {
  id: string;
  name: string;
  service: string;
  api_key: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", service: "", api_key: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApiKeys(data);
    }
    setLoading(false);
  };

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.service || !newKey.api_key) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("api_keys").insert([newKey]);

    if (error) {
      toast({ title: "Failed to add API key", variant: "destructive" });
    } else {
      toast({ title: "API key added successfully" });
      setNewKey({ name: "", service: "", api_key: "" });
      setDialogOpen(false);
      fetchApiKeys();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (!error) {
      toast({ title: "API key deleted" });
      fetchApiKeys();
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••" + key.slice(-4);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Keys Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Pexels API"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Input
                  placeholder="e.g., pexels, unsplash, pixabay"
                  value={newKey.service}
                  onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  placeholder="Your API key"
                  value={newKey.api_key}
                  onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                />
              </div>
              <Button onClick={handleAddKey} className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add API Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No API keys configured</p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
              >
                <div className="space-y-1">
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-muted-foreground">Service: {key.service}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      {showKey[key.id] ? key.api_key : maskKey(key.api_key)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleKeyVisibility(key.id)}
                    >
                      {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
