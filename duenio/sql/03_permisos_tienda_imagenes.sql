-- =========================================================
-- PERMISOS PARA public.tienda_imagenes
-- La tabla ya fue creada. Ejecuta este bloque una sola vez.
-- =========================================================

alter table public.tienda_imagenes enable row level security;

grant select
on public.tienda_imagenes
TO anon, authenticated;

grant insert, update, delete
on public.tienda_imagenes
TO authenticated;

grant usage, select
on all sequences in schema public
TO authenticated;

drop policy if exists "publico_lee_tienda_imagenes"
on public.tienda_imagenes;

drop policy if exists "duenio_inserta_tienda_imagenes"
on public.tienda_imagenes;

drop policy if exists "duenio_edita_tienda_imagenes"
on public.tienda_imagenes;

drop policy if exists "duenio_elimina_tienda_imagenes"
on public.tienda_imagenes;

create policy "publico_lee_tienda_imagenes"
on public.tienda_imagenes
for select
TO anon, authenticated
using (true);

create policy "duenio_inserta_tienda_imagenes"
on public.tienda_imagenes
for insert
TO authenticated
with check (public.es_duenio());

create policy "duenio_edita_tienda_imagenes"
on public.tienda_imagenes
for update
TO authenticated
using (public.es_duenio())
with check (public.es_duenio());

create policy "duenio_elimina_tienda_imagenes"
on public.tienda_imagenes
for delete
TO authenticated
using (public.es_duenio());
