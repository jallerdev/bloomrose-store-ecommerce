-- Función Trigger para crear perfiles automáticamente en el esquema Drizzle `profiles`
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    'CUSTOMER'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar de forma segura triggers arcaicos.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear hook transaccional amparado por Supabase sobre todos los sign ups.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
