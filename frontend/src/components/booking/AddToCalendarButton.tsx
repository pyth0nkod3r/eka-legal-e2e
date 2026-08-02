import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { Booking } from "@/types";
import { api } from "@/services/api";

interface AddToCalendarButtonProps {
  booking: Booking;
  variant?: "outline" | "gold" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function AddToCalendarButton({
  booking,
  variant = "outline",
  size = "sm",
}: AddToCalendarButtonProps) {
  // Format dates for calendar URLs (YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS)
  const formatIsoForCalendar = (dateStr: string, timeStr: string, durationMinutes = 30) => {
    try {
      const start = new Date(`${dateStr}T${timeStr}:00`);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      
      const toCalStr = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      return {
        startStr: toCalStr(start),
        endStr: toCalStr(end),
        startIso: start.toISOString(),
        endIso: end.toISOString(),
      };
    } catch (e) {
      const cleanDate = dateStr.replace(/-/g, "");
      const cleanTime = timeStr.replace(/:/g, "") + "00";
      return {
        startStr: `${cleanDate}T${cleanTime}`,
        endStr: `${cleanDate}T${cleanTime}`,
        startIso: `${dateStr}T${timeStr}:00Z`,
        endIso: `${dateStr}T${timeStr}:00Z`,
      };
    }
  };

  const { startStr, endStr, startIso, endIso } = formatIsoForCalendar(
    booking.date,
    booking.time,
    booking.consultationType?.duration || 30
  );

  const title = encodeURIComponent(
    `Eka Legal Consultation - ${booking.consultationType?.name || "Appointment"}`
  );
  const details = encodeURIComponent(
    `Legal Consultation with ${booking.clientName}.\nReason: ${booking.reason}\nVideo Call Link: ${
      booking.videoUrl || "Provided prior to meeting"
    }`
  );
  const location = encodeURIComponent(booking.videoUrl || "Online Video Call");

  // Google Calendar URL
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

  // Outlook 365 / Outlook.com URL
  const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${details}&startdt=${startIso}&enddt=${endIso}&location=${location}`;

  const handleDownloadIcs = () => {
    const icsUrl = api.booking.getIcsUrl(booking.id);
    const link = document.createElement("a");
    link.href = icsUrl;
    link.download = `appointment-${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-xs"
          onClick={() => window.open(googleUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-3.5 w-3.5 text-gold" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-xs"
          onClick={() => window.open(outlookUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-3.5 w-3.5 text-gold" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-xs"
          onClick={handleDownloadIcs}
        >
          <Download className="h-3.5 w-3.5 text-gold" />
          Download .ics File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
