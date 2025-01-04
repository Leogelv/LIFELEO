/* Создаем таблицу todos */
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  done boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deadline timestamp with time zone not null,
  telegram_id bigint not null
);

/* Создаем индексы */
create index if not exists todos_telegram_id_idx on todos(telegram_id);
create index if not exists todos_deadline_idx on todos(deadline);

/* Добавляем тестовые данные */
insert into todos (telegram_id, name, done, created_at, deadline) values
  (375634162, 'Сделать зарядку', false, now(), now() + interval '2 hours'),
  (375634162, 'Купить продукты', false, now(), now() + interval '1 day'),
  (375634162, 'Почитать книгу', false, now(), now() - interval '1 hour'); 