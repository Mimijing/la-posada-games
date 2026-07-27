-- =========================================================
-- PANEL DEL DUEÑO — LA POSADA GAMES AND DRINKS
--
-- IMPORTANTE:
-- 1. Crea primero al usuario del dueño en Supabase Authentication.
-- 2. Ejecuta este archivo.
-- 3. Ejecuta registrar_duenio.sql con el correo correcto.
-- =========================================================

-- Tabla privada de usuarios autorizados.
create table if not exists public.duenios (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table public.duenios enable row level security;

-- Esta función comprueba si la sesión pertenece al dueño.
create or replace function public.es_duenio()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.duenios
        where user_id = auth.uid()
    );
$$;

revoke all on function public.es_duenio() from public;
grant execute on function public.es_duenio() to authenticated;

-- Activar RLS en todas las tablas administradas.
alter table public.catalogo_juegos enable row level security;
alter table public.menu enable row level security;
alter table public.tienda enable row level security;
alter table public.promociones enable row level security;
alter table public.anuncios enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.catalogo_juegos to anon;
grant select on public.menu to anon;
grant select on public.tienda to anon;
grant select on public.promociones to anon;
grant select on public.anuncios to anon;

grant select, insert, update, delete
on public.catalogo_juegos, public.menu, public.tienda,
   public.promociones, public.anuncios
to authenticated;

grant usage, select
on all sequences in schema public
to authenticated;

-- =========================================================
-- ELIMINAR POLÍTICAS ANTERIORES QUE PERMITÍAN A CUALQUIER
-- USUARIO AUTENTICADO EDITAR.
-- =========================================================

drop policy if exists "publico_lee_catalogo"
on public.catalogo_juegos;
drop policy if exists "duenio_lee_catalogo"
on public.catalogo_juegos;
drop policy if exists "duenio_inserta_catalogo"
on public.catalogo_juegos;
drop policy if exists "duenio_edita_catalogo"
on public.catalogo_juegos;
drop policy if exists "duenio_elimina_catalogo"
on public.catalogo_juegos;

drop policy if exists "publico_lee_menu"
on public.menu;
drop policy if exists "publico_lee_menu_disponible"
on public.menu;
drop policy if exists "duenio_lee_menu"
on public.menu;
drop policy if exists "duenio_inserta_menu"
on public.menu;
drop policy if exists "duenio_edita_menu"
on public.menu;
drop policy if exists "duenio_elimina_menu"
on public.menu;

drop policy if exists "publico_lee_tienda"
on public.tienda;
drop policy if exists "duenio_lee_tienda"
on public.tienda;
drop policy if exists "duenio_inserta_tienda"
on public.tienda;
drop policy if exists "duenio_edita_tienda"
on public.tienda;
drop policy if exists "duenio_elimina_tienda"
on public.tienda;

drop policy if exists "publico_lee_promociones_activas"
on public.promociones;
drop policy if exists "duenio_lee_promociones"
on public.promociones;
drop policy if exists "duenio_inserta_promociones"
on public.promociones;
drop policy if exists "duenio_edita_promociones"
on public.promociones;
drop policy if exists "duenio_elimina_promociones"
on public.promociones;

drop policy if exists "publico_lee_anuncios"
on public.anuncios;
drop policy if exists "duenio_lee_anuncios"
on public.anuncios;
drop policy if exists "duenio_inserta_anuncios"
on public.anuncios;
drop policy if exists "duenio_edita_anuncios"
on public.anuncios;
drop policy if exists "duenio_elimina_anuncios"
on public.anuncios;

-- =========================================================
-- LECTURA PÚBLICA
-- =========================================================

create policy "publico_lee_catalogo"
on public.catalogo_juegos
for select
to anon
using (true);

create policy "publico_lee_menu_disponible"
on public.menu
for select
to anon
using (disponible = true);

create policy "publico_lee_tienda"
on public.tienda
for select
to anon
using (true);

create policy "publico_lee_promociones_activas"
on public.promociones
for select
to anon
using (activo = true);

create policy "publico_lee_anuncios"
on public.anuncios
for select
to anon
using (true);

-- =========================================================
-- POLÍTICAS EXCLUSIVAS DEL DUEÑO
-- =========================================================

create policy "duenio_lee_catalogo"
on public.catalogo_juegos
for select
to authenticated
using (public.es_duenio());

create policy "duenio_inserta_catalogo"
on public.catalogo_juegos
for insert
to authenticated
with check (public.es_duenio());

create policy "duenio_edita_catalogo"
on public.catalogo_juegos
for update
to authenticated
using (public.es_duenio())
with check (public.es_duenio());

create policy "duenio_elimina_catalogo"
on public.catalogo_juegos
for delete
to authenticated
using (public.es_duenio());

create policy "duenio_lee_menu"
on public.menu
for select
to authenticated
using (public.es_duenio());

create policy "duenio_inserta_menu"
on public.menu
for insert
to authenticated
with check (public.es_duenio());

create policy "duenio_edita_menu"
on public.menu
for update
to authenticated
using (public.es_duenio())
with check (public.es_duenio());

create policy "duenio_elimina_menu"
on public.menu
for delete
to authenticated
using (public.es_duenio());

create policy "duenio_lee_tienda"
on public.tienda
for select
to authenticated
using (public.es_duenio());

create policy "duenio_inserta_tienda"
on public.tienda
for insert
to authenticated
with check (public.es_duenio());

create policy "duenio_edita_tienda"
on public.tienda
for update
to authenticated
using (public.es_duenio())
with check (public.es_duenio());

create policy "duenio_elimina_tienda"
on public.tienda
for delete
to authenticated
using (public.es_duenio());

create policy "duenio_lee_promociones"
on public.promociones
for select
to authenticated
using (public.es_duenio());

create policy "duenio_inserta_promociones"
on public.promociones
for insert
to authenticated
with check (public.es_duenio());

create policy "duenio_edita_promociones"
on public.promociones
for update
to authenticated
using (public.es_duenio())
with check (public.es_duenio());

create policy "duenio_elimina_promociones"
on public.promociones
for delete
to authenticated
using (public.es_duenio());

create policy "duenio_lee_anuncios"
on public.anuncios
for select
to authenticated
using (public.es_duenio());

create policy "duenio_inserta_anuncios"
on public.anuncios
for insert
to authenticated
with check (public.es_duenio());

create policy "duenio_edita_anuncios"
on public.anuncios
for update
to authenticated
using (public.es_duenio())
with check (public.es_duenio());

create policy "duenio_elimina_anuncios"
on public.anuncios
for delete
to authenticated
using (public.es_duenio());

-- =========================================================
-- STORAGE DE IMÁGENES
-- Bucket público: las imágenes deben verse en la página pública.
-- Solo el dueño puede subir, actualizar o borrar archivos.
-- =========================================================

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'imagenes-la-posada',
    'imagenes-la-posada',
    true,
    5242880,
    array[
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
on conflict (id)
do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "duenio_lee_imagenes_la_posada"
on storage.objects;

drop policy if exists "duenio_sube_imagenes_la_posada"
on storage.objects;

drop policy if exists "duenio_actualiza_imagenes_la_posada"
on storage.objects;

drop policy if exists "duenio_elimina_imagenes_la_posada"
on storage.objects;

create policy "duenio_lee_imagenes_la_posada"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'imagenes-la-posada'
    and public.es_duenio()
);

create policy "duenio_sube_imagenes_la_posada"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'imagenes-la-posada'
    and public.es_duenio()
);

create policy "duenio_actualiza_imagenes_la_posada"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'imagenes-la-posada'
    and public.es_duenio()
)
with check (
    bucket_id = 'imagenes-la-posada'
    and public.es_duenio()
);

create policy "duenio_elimina_imagenes_la_posada"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'imagenes-la-posada'
    and public.es_duenio()
);
