alter table public.games add column if not exists price_krw integer;
update public.games set price_krw = 0 where price_krw is null;
alter table public.games alter column price_krw set default 0;
alter table public.games alter column price_krw set not null;
alter table public.games drop constraint if exists games_price_krw_check;
alter table public.games add constraint games_price_krw_check check (price_krw >= 0);

drop policy if exists "approved game update" on public.games;
create policy "approved game update" on public.games for update using (public.is_approved()) with check (public.is_approved());
