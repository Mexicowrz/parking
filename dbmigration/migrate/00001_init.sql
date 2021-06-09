SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;

/* # global - схема для общих функций и таблиц */
CREATE SCHEMA global;

/* ## Типы */
/* ### u_return_data - структура данных, возвращаемая клиенту */
CREATE TYPE global.u_return_data AS
(
	data json,
	isok boolean,
	message text,
	errorcode integer
);

/* ## Функции */
/* ### s_make_return_data - системная функция для создания структуры возвращаемых данных */
CREATE OR REPLACE FUNCTION global.s_make_return_data(
	f_data json,
	f_isok boolean,
	f_message text,
	f_errorcode integer)
    RETURNS global.u_return_data
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE

AS $BODY$
DECLARE return_value global.u_return_data;
BEGIN
	return_value.data = f_data;
	return_value.isok = f_isok;
	return_value.message = f_message;
	return_value.errorcode = f_errorcode;
	return return_value;
END;
$BODY$;


/* # auth - схема для работы с пользователями */
CREATE SCHEMA auth;

/* ## Таблицы */
/* ### User - пользователи системы */
CREATE TABLE auth."User"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    username text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    lastname text COLLATE pg_catalog."default",
    firstname text COLLATE pg_catalog."default",
    middlename text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    flat integer,
    role integer NOT NULL,
    is_blocking boolean DEFAULT false,
    phone text COLLATE pg_catalog."default",
    car_number text COLLATE pg_catalog."default",
    CONSTRAINT "User_pkey" PRIMARY KEY (id),
    CONSTRAINT "User_flat_key" UNIQUE (flat),
    CONSTRAINT "User_username_key" UNIQUE (username)
)

TABLESPACE pg_default;

COMMENT ON COLUMN auth."User".role
    IS '0 - admin
1 - place owner
2 - customer';

/* ## Функции */
/* ### e_login - авторизация пользователей */
CREATE OR REPLACE FUNCTION auth.e_login(f_username text, f_password text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE m_user auth."User";
		m_password text;
BEGIN
	SELECT * into m_user FROM auth."User"
		WHERE username=f_username;
	IF NOT FOUND THEN
		return global.s_make_return_data(null, false, 'user_not_found', 404);
	END IF;

	if m_user.is_blocking=true then
		return global.s_make_return_data(null, false, 'user_blocking', 403);
	end if;

	m_password = md5(f_password);
	if m_password is null or m_user.password<>m_password then
		return global.s_make_return_data(null, false, 'wrong_password', 403);
	end if;

	return global.s_make_return_data(json_build_object('id', m_user.id, 'username', m_user.username, 'lastname', m_user.lastname, 'firstname', m_user.firstname, 'middlename', m_user.middlename, 'description', m_user.description, 'flat', m_user.flat, 'role', m_user.role), true, null, 200);
END;
$function$
;

/* ### e_user_add - добавление пользователя */
CREATE OR REPLACE FUNCTION auth.e_user_add(f_admin_username text, f_username text, f_password text, f_lastname text, f_firstname text, f_middlename text, f_description text, f_flat integer, f_role integer, f_is_blocking boolean, f_places integer[], f_phone text, f_car_number text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE m_userid INTEGER;
BEGIN
	if not exists (SELECT id from auth."User" where username=f_admin_username and role=0) then
		return global.s_make_return_data(null, false, 'forbidden', 403);
	end if;

	INSERT INTO auth."User"(
		username, password, lastname, firstname, middlename, description, flat, role, is_blocking, phone, car_number)
	VALUES (f_username,MD5(f_password), f_lastname, f_firstname, f_middlename, f_description, f_flat, f_role, f_is_blocking, f_phone, f_car_number)
	returning id into m_userid;

	if f_places is not null then
		INSERT INTO park."Place_Owner" (place_id, user_id)
		SELECT unnest(f_places), m_userid;
	end if;

	return global.s_make_return_data(json_build_object('id',m_userid), true, null, 200);
END;
$function$
;

/* ### e_user_delete - удаление пользователя */
CREATE OR REPLACE FUNCTION auth.e_user_delete(f_admin_username text, f_id integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE m_userid INTEGER;
BEGIN
	if not exists (SELECT id from auth."User" where username=f_admin_username and role=0) then
		return global.s_make_return_data(null, false, 'forbidden', 403);
	end if;

	DELETE FROM auth."User" where id=f_id;
	return global.s_make_return_data(json_build_object('id',f_id), true, null, 200);
END;
$function$
;

/* ### e_user_get - получение пользователя */
CREATE OR REPLACE FUNCTION auth.e_user_get(f_admin_username text, f_id integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	if not exists (SELECT id from auth."User" where (username=f_admin_username and role=0) or (username=f_admin_username and id=f_id))  then
		return global.s_make_return_data(null, false, 'forbidden', 403);
	end if;

	return global.s_make_return_data((
		SELECT json_build_object('id', us.id, 'username', us.username, 'firstname', us.firstname, 'lastname', us.lastname, 'middlename', us.middlename, 'role', us.role, 'flat', us.flat, 'description', us.description, 'is_blocking', us.is_blocking, 'places', pp.places, 'phone', us.phone, 'car_number', us.car_number)
			FROM auth."User" us
			LEFT JOIN LATERAL (SELECT coalesce(json_agg(pl.place_id),'[]'::json) as places FROM park."Place_Owner" pl WHERE pl.user_id=f_id) pp ON TRUE
			WHERE us.id=f_id
	), true, null, 200);
END;
$function$
;

/* ### e_user_get_list - получение списка пользователей */
CREATE OR REPLACE FUNCTION auth.e_user_get_list(f_username text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	IF NOT EXISTS (SELECT id FROM auth."User" where username=f_username and role=0) then
		return global.s_make_return_data(null, false, 'fobidden', 403);
	end if;

	return global.s_make_return_data((SELECT json_agg(json_build_object('id', id, 'username', username, 'lastname', lastname, 'firstname', firstname, 'middlename', middlename, 'role', "role", 'is_blocking', is_blocking, 'flat', flat) order by username)
									 	FROM auth."User"
									 ), true, null, 200);
END;
$function$
;

/* ### e_user_getinfo - получение информации о залогиненом пользователе */
CREATE OR REPLACE FUNCTION auth.e_user_getinfo(f_username text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE	m_user auth."User";
BEGIN
	SELECT * into m_user FROM auth."User"
		WHERE username=f_username;
	IF NOT FOUND THEN
		return global.s_make_return_data(null, false, 'user_not_found', 404);
	END IF;
	if m_user.is_blocking=true then
		return global.s_make_return_data(null, false, 'user_blocking', 403);
	end if;

	return global.s_make_return_data(json_build_object('id', m_user.id, 'username', m_user.username, 'lastname', m_user.lastname, 'firstname', m_user.firstname, 'middlename', m_user.middlename, 'description', m_user.description, 'flat', m_user.flat, 'role', m_user.role), true, '', 200);
END;
$function$
;

/* ### e_user_private_update - обновление личной информации пользователя */
CREATE OR REPLACE FUNCTION auth.e_user_private_update(f_admin_username text, f_id integer, f_password text, f_lastname text, f_firstname text, f_middlename text, f_phone text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	if not exists (SELECT id from auth."User" where username=f_admin_username and f_id=id) then
		return global.s_make_return_data(null, false, 'forbidden', 403);
	end if;

	UPDATE auth."User" SET
		password = CASE WHEN f_password is null or f_password='' then password else md5(f_password) end,
		lastname=f_lastname,
		firstname=f_firstname,
		middlename=f_middlename,
		phone=f_phone
	where id=f_id;

	return global.s_make_return_data(json_build_object('id',f_id), true, null, 200);
END;
$function$
;

/* ### e_user_update - обновление денных пользователей */
CREATE OR REPLACE FUNCTION auth.e_user_update(f_admin_username text, f_id integer, f_password text, f_lastname text, f_firstname text, f_middlename text, f_description text, f_flat integer, f_role integer, f_is_blocking boolean, f_places integer[], f_phone text, f_car_number text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	if not exists (SELECT id from auth."User" where username=f_admin_username and role=0) then
		return global.s_make_return_data(null, false, 'forbidden', 403);
	end if;

	UPDATE auth."User" SET
		password = CASE WHEN f_password is null or f_password='' then password else md5(f_password) end,
		lastname=f_lastname,
		firstname=f_firstname,
		middlename=f_middlename,
		description=f_description,
		flat=f_flat,
		role=f_role,
		is_blocking=f_is_blocking,
		phone=f_phone,
		car_number=f_car_number
	where id=f_id;

	DELETE FROM park."Place_Owner" WHERE user_id=f_id;

	if f_places is not null then
		INSERT INTO park."Place_Owner" (place_id, user_id)
		SELECT unnest(f_places), f_id;
	end if;

	return global.s_make_return_data(json_build_object('id',f_id), true, null, 200);
END;
$function$
;


/* # park - схема для работы с парковочными местами */
CREATE SCHEMA park;

/* ## Таблицы */
/* ### Place - парковочное место */
CREATE TABLE park."Place"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "number" integer NOT NULL,
    rect box,
    CONSTRAINT "Place_pkey" PRIMARY KEY (id),
    CONSTRAINT "Place_number_key" UNIQUE ("number")
)

TABLESPACE pg_default;

/* ### Place_Owner - определение владельцев мест */
CREATE TABLE park."Place_Owner"
(
    place_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT "Place_Owner_pkey" PRIMARY KEY (place_id, user_id),
    CONSTRAINT "Place_Owner_place_id_fkey" FOREIGN KEY (place_id)
        REFERENCES park."Place" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "Place_Owner_user_id_fkey" FOREIGN KEY (user_id)
        REFERENCES auth."User" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

/* ### Free_Place - места, которые можно занять */
CREATE TABLE park."Free_Place"
(
    place_id integer NOT NULL,
    date_from timestamp without time zone,
    date_to timestamp without time zone,
    customer_user_id integer,
    status integer,
    added_by text COLLATE pg_catalog."default",
    createdat timestamp without time zone,
    customer_date_from timestamp without time zone,
    customer_date_to timestamp without time zone,
    CONSTRAINT "Free_Place_pkey" PRIMARY KEY (place_id),
    CONSTRAINT "Free_Place_customer_user_id_fkey" FOREIGN KEY (customer_user_id)
        REFERENCES auth."User" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT "Free_Place_place_id_fkey" FOREIGN KEY (place_id)
        REFERENCES park."Place" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

COMMENT ON COLUMN park."Free_Place".status
    IS '0 - свободно
1 - занято';

/* ### Message - сообщения пользователям от админов */
CREATE TABLE park."Message"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    message text COLLATE pg_catalog."default",
    is_visible boolean,
    type integer,
    CONSTRAINT "Message_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

COMMENT ON COLUMN park."Message".type
    IS '0 - info
1 - warning
2 - danger';


/* ## Функции */
/* ### e_check_freeplace_dates - проверка дат выставленных мест (не пора ли их снимать) */
CREATE OR REPLACE FUNCTION park.e_check_freeplace_dates()
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE rem_places JSON;
BEGIN
	SELECT json_agg(place_id) into rem_places FROM
		park."Free_Place" WHERE (now() at time zone 'utc') >=date_to
			or (customer_date_to is not null and (now() at time zone 'utc') >=customer_date_to)
			or (status=-1 and date_from <= (now() at time zone 'utc'));

	DELETE FROM park."Free_Place"
		WHERE (now() at time zone 'utc') >= date_to;

	UPDATE park."Free_Place"
		SET customer_user_id=null,
			status=0,
			customer_date_from=null,
			customer_date_to=null
	WHERE customer_date_to is not null and (now() at time zone 'utc') >=customer_date_to;

	UPDATE park."Free_Place"
		SET status=0
	WHERE status=-1 and date_from <= (now() at time zone 'utc');

	return global.s_make_return_data(rem_places, true, null, 200);
END;
$function$
;

/* ### e_get_all_places - получение списка всех мест */
CREATE OR REPLACE FUNCTION park.e_get_all_places(f_username text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	RETURN global.s_make_return_data((SELECT JSON_AGG(ROW_TO_JSON(pl.*)) FROM park."Place" pl), true, null, 200);
END;
$function$
;

/* ### e_get_free_place_list - получение списка свободных мест */
CREATE OR REPLACE FUNCTION park.e_get_free_place_list()
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	return global.s_make_return_data((SELECT coalesce(json_agg(row_to_json(t1.*) ORDER BY status desc, date_to desc),'[]'::json)
		FROM
		(SELECT place_id, date_from, date_to, customer_user_id, status,
			customer_date_from, customer_date_to, us.username, pl.number
			FROM park."Free_Place" fp
			INNER JOIN park."Place" pl ON fp.place_id=pl.id
			LEFT JOIN auth."User" us ON us.id=customer_user_id
		WHERE date_from<=(now() at time zone 'utc') and date_to>(now() at time zone 'utc')) t1),
		true, null, 200);
END;
$function$
;

/* ### e_get_messages - получение списка видимых пользователям сообщений */
CREATE OR REPLACE FUNCTION park.e_get_messages(f_username text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	RETURN global.s_make_return_data((SELECT coalesce(JSON_AGG(JSON_BUILD_OBJECT('id', id, 'message', message, 'type', type)),'[]'::json) FROM park."Message" where is_visible=true), true, null, 200);
END;
$function$
;

/* ### e_get_user_places - получение списка мест пользователя */
CREATE OR REPLACE FUNCTION park.e_get_user_places(f_username text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE return_data json;
BEGIN
	SELECT json_agg(json_build_object('id',pl.id, 'number', pl.number, 'free',
									 	case when fp.place_id is null then null else json_build_object('place_id', fp.place_id, 'date_from', fp.date_from, 'date_to', fp.date_to, 'customer_user_id', fp.customer_user_id, 'status', fp.status, 'createdat', fp.createdat,
																									   'customer_date_from', fp.customer_date_from, 'customer_date_to', fp.customer_date_to,
																									 	'user', case when cust.id is null then null else json_build_object('id', cust.id, 'firstname', cust.firstname, 'lastname', cust.lastname, 'middlename', cust.middlename, 'username', cust.username) end
																									  ) end
									 )) into return_data FROM park."Place" pl
		INNER JOIN auth."User" usr ON usr.username=f_username
		LEFT JOIN park."Free_Place" fp ON fp.place_id=pl.id
		LEFT JOIN auth."User" cust ON cust.id=fp.customer_user_id
	WHERE usr.role=0 or pl.id in
		(SELECT po.place_id FROM park."Place_Owner" po WHERE po.user_id=usr.id);
	return global.s_make_return_data(return_data, true, '',200);
END;
$function$
;

/* ### e_message_add - добавление админом сообещния для пользователей */
CREATE OR REPLACE FUNCTION park.e_message_add(f_username text, f_message text, f_is_visible boolean, f_type integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE m_msg_id INTEGER;
BEGIN
	IF NOT EXISTS (SELECT id FROM auth."User" where username=f_username and role=0) then
		return global.s_make_return_data(null, false, 'fobidden', 403);
	end if;
	INSERT INTO park."Message" (message, is_visible, type)
		VALUES (f_message, f_is_visible, f_type)
	RETURNING id into m_msg_id;
	return global.s_make_return_data(json_build_object('id', m_msg_id),true,null, 200);
END;
$function$
;

/* ### e_message_delete - удаление админом сообещния для пользователей */
CREATE OR REPLACE FUNCTION park.e_message_delete(f_username text, f_id integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	IF NOT EXISTS (SELECT id FROM auth."User" where username=f_username and role=0) then
		return global.s_make_return_data(null, false, 'fobidden', 403);
	end if;
	DELETE FROM park."Message" WHERE id=f_id;
	return global.s_make_return_data(json_build_object('id', f_id),true,null, 200);
END;
$function$
;

/* ### e_message_delete - удаление админом сообещния для пользователей */
CREATE OR REPLACE FUNCTION park.e_message_get_all(f_username text)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	IF NOT EXISTS (SELECT id FROM auth."User" where username=f_username and role=0) then
		return global.s_make_return_data(null, false, 'fobidden', 403);
	end if;
	return global.s_make_return_data((SELECT coalesce(JSON_AGG(ROW_TO_JSON(m.*)),'[]'::json) FROM park."Message" m), true, null, 200);
END;
$function$
;
/* ### e_message_update - обновление админом сообещния для пользователей */
CREATE OR REPLACE FUNCTION park.e_message_update(f_username text, f_id integer, f_message text, f_is_visible boolean, f_type integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	IF NOT EXISTS (SELECT id FROM auth."User" where username=f_username and role=0) then
		return global.s_make_return_data(null, false, 'fobidden', 403);
	end if;
	UPDATE park."Message" SET
		message=f_message,
		is_visible=f_is_visible,
		type=f_type
	WHERE id=f_id;
	return global.s_make_return_data(json_build_object('id', f_id),true,null, 200);
END;
$function$
;
/* ### e_release_free_place - вернуть свободное место в выбор другим пользователем */
CREATE OR REPLACE FUNCTION park.e_release_free_place(f_username text, f_place_id integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	if not exists (SELECT fp.place_id FROM park."Free_Place" fp
			   		INNER JOIN auth."User" usr ON usr.id=fp.customer_user_id
			   		where usr.username=f_username and fp.place_id=f_place_id) then
		return global.s_make_return_data(null,false,'cant_release', 400);
	end if;
	UPDATE park."Free_Place" fp
		SET customer_user_id=null,
			status=0,
			customer_date_to=null,
			customer_date_from=null
	FROM auth."User" usr
		WHERE usr.username=f_username and fp.place_id=f_place_id;
	PERFORM journal.s_add_user_activity(f_username, 'Release', f_place_id, null);
	return global.s_make_return_data(json_build_object('id',f_place_id), true,null,200);
END;
$function$
;
/* ### e_release_free_place - отозвать свое место */
CREATE OR REPLACE FUNCTION park.e_respond_place(f_username text, f_place_id integer)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	IF not park.s_check_user_place_permission(f_username, f_place_id) then
		return global.s_make_return_data(null,false, 'access_denied', 403);
	end if;

	DELETE FROM park."Free_Place" WHERE place_id=f_place_id;

	PERFORM journal.s_add_user_activity(f_username, 'Respond', f_place_id, null);
	return global.s_make_return_data(json_build_object('id',f_place_id), true,null,200);
END;
$function$
;

/* ### e_set_free_place - выставить место на выбор другими */
CREATE OR REPLACE FUNCTION park.e_set_free_place(f_username text, f_place_id integer, f_date_from timestamp without time zone, f_date_to timestamp without time zone)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
DECLARE free_place_id INTEGER;
BEGIN
	IF not park.s_check_user_place_permission(f_username, f_place_id) then
		return global.s_make_return_data(null,false, 'forbidden', 403);
	end if;

	if exists(SELECT place_id FROM park."Free_Place" WHERE place_id=f_place_id) then
		UPDATE park."Free_Place" fp
			SET date_from=f_date_from,
				date_to = f_date_to,
				customer_date_from = case when customer_date_from is null or customer_date_from>=f_date_from then customer_date_from else f_date_from end,
				customer_date_to = case when customer_date_to is null or customer_date_to<=f_date_to then customer_date_to else f_date_to end
		WHERE fp.place_id=f_place_id;
		PERFORM journal.s_add_user_activity(f_username, 'ChangeFree', f_place_id, jsonb_build_object('date_from', f_date_from, 'date_to', f_date_to));
	else
		INSERT INTO park."Free_Place" (place_id, date_from, date_to, status,added_by, createdat)
			VALUES (f_place_id, f_date_from, f_date_to, case when f_date_from <= (now() at time zone 'utc') then 0 else -1 end, f_username, now());
		PERFORM journal.s_add_user_activity(f_username, 'Free', f_place_id, jsonb_build_object('date_from', f_date_from, 'date_to', f_date_to));
	end if;

	return global.s_make_return_data(json_build_object('id',f_place_id), true, null, 200);
END;
$function$
;

/* ### e_take_free_place - забрать свободное место */
CREATE OR REPLACE FUNCTION park.e_take_free_place(f_username text, f_place_id integer, f_date_to timestamp without time zone)
 RETURNS global.u_return_data
 LANGUAGE plpgsql
AS $function$
BEGIN
	if exists (SELECT fp.place_id FROM park."Free_Place" fp
			   		INNER JOIN auth."User" usr ON usr.id=fp.customer_user_id
			   WHERE usr.username=f_username) then
		return global.s_make_return_data(null,false,'free_place', 400);
	end if;
	if exists (SELECT fp.place_id FROM park."Free_Place" fp
			   		where place_id=f_place_id and status<>0) then
		return global.s_make_return_data(null,false,'alreadу_taken', 400);
	end if;
	UPDATE park."Free_Place" fp
		SET customer_user_id=usr.id,
			status=1,
			customer_date_from=date_from,
			customer_date_to=f_date_to
	FROM auth."User" usr
		WHERE usr.username=f_username and fp.place_id=f_place_id;

	PERFORM journal.s_add_user_activity(f_username, 'Take', f_place_id, jsonb_build_object('date_to', f_date_to));

	return global.s_make_return_data(json_build_object('id',f_place_id), true,null,200);
END;
$function$
;

/* ### s_check_user_place_permission - системная функция проверки доступа пользователя к месту */
CREATE OR REPLACE FUNCTION park.s_check_user_place_permission(f_username text, f_place_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
	return EXISTS(SELECT usr.id FROM auth."User" usr
		WHERE usr.username=f_username
			AND (usr.role=0 or usr.id in (SELECT po.user_id FROM park."Place_Owner" po WHERE po.place_id=f_place_id)));
END;
$function$
;


/* # journal - схема для журналов */
CREATE SCHEMA journal;

/* ## Типы */
/* ### ActionType - тип события пользователя */
CREATE TYPE journal."ActionType" AS ENUM
    ('Free', 'ChangeFree', 'Respond', 'Take', 'Release');

/* ## Таблицы */
/* ### UserActivity - журнал активности пользователей */
CREATE TABLE journal."UserActivity"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    username text COLLATE pg_catalog."default",
    action journal."ActionType",
    place_id integer,
    update_date timestamp without time zone,
    params jsonb,
    CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;


/* ## Функции */
/* ### s_add_user_activity - системная функция для добавления записи в пользовательский журнал */
CREATE OR REPLACE FUNCTION journal.s_add_user_activity(
	f_username text,
	f_action journal."ActionType",
	f_place_id integer,
	f_params jsonb)
    RETURNS void
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE

AS $BODY$
BEGIN
	INSERT INTO journal."UserActivity"(username, action, place_id, update_date, params)
		VALUES (f_username, f_action, f_place_id, now(), f_params);
END;
$BODY$;


/** # Cекция добавления стартового набора данных **/
INSERT INTO auth."User"(
	username, password, lastname, firstname, role, is_blocking)
	VALUES ('admin', MD5('admin'), 'Администратор', 'А', 0, false);


INSERT INTO park."Place" ("number")
SELECT generate_series(1,10,1);

/** # Секция отката **/
/*
  DROP SCHEMA journal CASCADE;
  DROP SCHEMA park CASCADE;
  DROP SCHEMA auth CASCADE;
  DROP SCHEMA global CASCADE;
*/