# TODO List & Status

- [x] **Appointments Admin View & Features**: For unregistered clients, the admin can view submitted details (name, email, reason) with "Unregistered Guest" badge, reschedule appointments via interactive date/time picker, and launch/manage video calling.
- [x] **Pre-Registration Appointment Linking**: Clients who booked appointments prior to registering now have their past appointments linked to their account upon registration/login based on matching email address.
- [x] **Video Call Integration**: Zoom is configured as the default video provider with options for Google Meet and Jitsi Meet. Notifications are generated on-screen with schedule details and video link.
- [x] **Calendar Integration**: Added calendar export support for Google Calendar, Outlook Calendar (Office 365 & Outlook.com), and `.ics` file download.
- [x] **Decouple Database from Docker & Render**: Removed 30-day ephemeral database from Render/Docker setup and configured Neon PostgreSQL Cloud database support via `.env`.