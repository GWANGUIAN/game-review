alter table public.site_settings alter column site_title set default '종합 게임 동아리';
update public.site_settings set site_title = '종합 게임 동아리' where id = true;
