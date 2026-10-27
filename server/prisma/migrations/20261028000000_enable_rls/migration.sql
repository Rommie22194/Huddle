-- Supabase exposes the "public" schema through its REST API.
-- Turn on Row Level Security with no policies so that API roles (anon/authenticated)
-- can never read these tables. The app connects as the table owner, which bypasses RLS.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
