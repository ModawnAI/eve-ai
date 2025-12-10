-- Create a function to handle new user signup
-- This creates a user record in the users table when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_agency_id UUID;
BEGIN
  -- First, create a new agency for this user (each new signup gets their own agency)
  INSERT INTO public.agencies (name, email)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'agency_name', NEW.email || '''s Agency'),
    NEW.email
  )
  RETURNING id INTO new_agency_id;

  -- Then create the user profile linked to the new agency
  INSERT INTO public.users (id, agency_id, email, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    new_agency_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'admin', -- First user of an agency is always admin
    COALESCE((NEW.raw_user_meta_data->>'preferred_language')::text, 'en')::"language"
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.agencies TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
