import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://kyvrhwymvueocdupwpjg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dnJod3ltdnVlb2NkdXB3cGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjI0OTMsImV4cCI6MjA4ODYzODQ5M30.Y412SilGG9NGWjwsadE9dmdZ4Ofg3iGrRX-AVCpYNE0"
);
