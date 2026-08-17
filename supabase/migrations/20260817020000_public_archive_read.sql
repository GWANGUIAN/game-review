-- The archive is intentionally readable without an account. Write policies remain unchanged.
create policy "public archive profiles read" on public.profiles for select using (true);
create policy "public archive games read" on public.games for select using (true);
create policy "public archive sessions read" on public.play_sessions for select using (true);
create policy "public archive blocks read" on public.session_play_blocks for select using (true);
create policy "public archive participants read" on public.session_participants for select using (true);
create policy "public archive reviews read" on public.reviews for select using (true);
