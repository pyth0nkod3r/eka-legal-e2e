import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, Copy, ExternalLink, Settings, Check } from "lucide-react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface VideoCallModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
  onSuccess?: () => void;
}

export default function VideoCallModal({
  booking,
  open,
  onOpenChange,
  isAdmin = false,
  onSuccess,
}: VideoCallModalProps) {
  const [provider, setProvider] = useState<string>(
    booking?.videoProvider || "zoom"
  );
  const [customUrl, setCustomUrl] = useState<string>(booking?.videoUrl || "");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;

  const currentVideoUrl =
    booking.videoUrl ||
    `https://zoom.us/j/${booking.id.replace("booking-", "")}?pwd=EkaLegalConsultation`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentVideoUrl);
    setCopied(true);
    toast({ title: "Copied!", description: "Video call link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveVideoSettings = async () => {
    setSubmitting(true);
    try {
      const res = await api.booking.updateVideoUrl(
        booking.id,
        provider,
        customUrl
      );
      if (res.success) {
        toast({
          title: "Video Link Updated",
          description: `Provider set to ${provider.toUpperCase()}`,
        });
        setEditing(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Update Failed",
          description: res.message || "Failed to update video link",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Video className="h-5 w-5 text-gold" />
            Video Call Details
          </DialogTitle>
          <DialogDescription>
            Online consultation for {booking.clientName} ({booking.consultationType.name})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Default Provider
              </div>
              <div className="font-semibold capitalize flex items-center gap-2 mt-0.5">
                {booking.videoProvider || "Zoom"}
                <Badge variant="outline" className="text-[10px] bg-accent/10 border-accent text-accent">
                  Active
                </Badge>
              </div>
            </div>
            {isAdmin && !editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="text-xs flex items-center gap-1"
              >
                <Settings className="h-3.5 w-3.5" /> Configure
              </Button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Meeting Link
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={currentVideoUrl}
                    className="font-mono text-xs bg-background"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => window.open(currentVideoUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4" /> Join Meeting Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 border p-4 rounded-lg bg-card">
              <h4 className="font-medium text-sm">Select Video Platform</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "zoom", label: "Zoom (Default)" },
                  { id: "google_meet", label: "Google Meet" },
                  { id: "jitsi", label: "Jitsi Meet" },
                ].map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    variant={provider === p.id ? "gold" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setProvider(p.id)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Custom Meeting URL (Optional)
                </label>
                <Input
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleSaveVideoSettings}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
