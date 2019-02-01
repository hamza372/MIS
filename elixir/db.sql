
create table auth (
	id text unique not null,
	password text not null
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

create table call_masking (
	incomer_id text not null,
	numbers text[] not null,
	outgoing_num text not null,
	mask_num text not null
);

create index on call_masking(mask_num);
create index mask_num_idx on call_masking using GIN (numbers);