import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Bell, AlertTriangle, Gift, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Bell className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  promo: <Gift className="w-4 h-4" />,
  update: <Sparkles className="w-4 h-4" />,
};

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("notifications").insert([newNotification]);

    if (error) {
      toast({ title: "Failed to add notification", variant: "destructive" });
    } else {
      toast({ title: "Notification created successfully" });
      setNewNotification({ title: "", message: "", type: "info" });
      setDialogOpen(false);
      fetchNotifications();
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_active })
      .eq("id", id);

    if (!error) {
      fetchNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (!error) {
      toast({ title: "Notification deleted" });
      fetchNotifications();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications & Announcements</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Notification title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Notification message..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Notification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border"
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                    notification.type === 'promo' ? 'bg-green-500/10 text-green-500' :
                    notification.type === 'update' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {typeIcons[notification.type]}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notification.is_active}
                    onCheckedChange={(checked) => handleToggle(notification.id, checked)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(notification.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
