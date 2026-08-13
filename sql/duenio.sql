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




    insert into public.duenios (
    user_id
)
select id
from auth.users
where lower(email) = lower('anahiwasap7@gmail.com')
on conflict (user_id) do nothing;

-- Comprobación:
select
    d.user_id,
    u.email,
    d.created_at
from public.duenios d
join auth.users u
    on u.id = d.user_id;
--subir git
--git status
--git add .
--git commit -m "Añade juegos, expansiones y fundas"
--git push