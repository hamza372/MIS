create table auth (
	id text unique not null,
	password text not null
);

create table mischool_sign_ups(
	id text unique not null,
	form jsonb
);

create table mischool_referrals (
	id text unique not null,
	time bigint,
	value jsonb
);

create table backup (
	school_id text unique not null,
	db jsonb
);

create table tokens (
	id text not null,
	token text not null,
	client_id text not null
);

create table writes (
	school_id text,
	path text[],
	value jsonb,
	time bigint,
	type text,
	client_id text,
	sync_time timestamp default current_timestamp
);

create index on writes(school_id);
create index on writes(time);