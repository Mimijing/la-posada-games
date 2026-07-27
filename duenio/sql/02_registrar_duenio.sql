-- =========================================================
-- REGISTRAR AL DUEÑO
--
-- 1. Crea primero el usuario en:
--    Supabase > Authentication > Users
--
-- 2. Reemplaza el correo de ejemplo por el correo real.
-- 3. Ejecuta este archivo una sola vez.
-- =========================================================

insert into public.duenios (
    user_id
)
select id
from auth.users
where lower(email) = lower('CAMBIA_AQUI_EL_CORREO_DEL_DUENIO')
on conflict (user_id) do nothing;

-- Comprobación:
select
    d.user_id,
    u.email,
    d.created_at
from public.duenios d
join auth.users u
    on u.id = d.user_id;
