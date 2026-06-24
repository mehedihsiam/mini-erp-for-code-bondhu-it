-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Create Tables

-- users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  first_name text,
  last_name text,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.users enable row level security;

-- products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sku text not null unique,
  description text,
  price numeric(10,2) not null,
  stock_quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.products enable row level security;

-- customers table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.customers enable row level security;

-- suppliers table
create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.suppliers enable row level security;

-- purchases table
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.suppliers(id) not null,
  total_amount numeric(10,2) not null default 0,
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.purchases enable row level security;

-- purchase_items table
create table public.purchase_items (
  id uuid default uuid_generate_v4() primary key,
  purchase_id uuid references public.purchases(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);
alter table public.purchase_items enable row level security;

-- sales table
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) not null,
  total_amount numeric(10,2) not null default 0,
  sale_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.sales enable row level security;

-- sale_items table
create table public.sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references public.sales(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);
alter table public.sale_items enable row level security;


-- 2. Setup RLS Policies

-- For an ERP, we typically want authenticated users to be able to access everything,
-- assuming they are authorized staff. You can refine these later if there are multiple roles.

-- users
create policy "Users can view own profile." on public.users for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile." on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- generic policies for authenticated users for other tables
create policy "Authenticated users can select products" on public.products for select to authenticated using (true);
create policy "Authenticated users can insert products" on public.products for insert to authenticated with check (true);
create policy "Authenticated users can update products" on public.products for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete products" on public.products for delete to authenticated using (true);

create policy "Authenticated users can select customers" on public.customers for select to authenticated using (true);
create policy "Authenticated users can insert customers" on public.customers for insert to authenticated with check (true);
create policy "Authenticated users can update customers" on public.customers for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete customers" on public.customers for delete to authenticated using (true);

create policy "Authenticated users can select suppliers" on public.suppliers for select to authenticated using (true);
create policy "Authenticated users can insert suppliers" on public.suppliers for insert to authenticated with check (true);
create policy "Authenticated users can update suppliers" on public.suppliers for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete suppliers" on public.suppliers for delete to authenticated using (true);

create policy "Authenticated users can select purchases" on public.purchases for select to authenticated using (true);
create policy "Authenticated users can insert purchases" on public.purchases for insert to authenticated with check (true);
create policy "Authenticated users can update purchases" on public.purchases for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete purchases" on public.purchases for delete to authenticated using (true);

create policy "Authenticated users can select purchase_items" on public.purchase_items for select to authenticated using (true);
create policy "Authenticated users can insert purchase_items" on public.purchase_items for insert to authenticated with check (true);
create policy "Authenticated users can update purchase_items" on public.purchase_items for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete purchase_items" on public.purchase_items for delete to authenticated using (true);

create policy "Authenticated users can select sales" on public.sales for select to authenticated using (true);
create policy "Authenticated users can insert sales" on public.sales for insert to authenticated with check (true);
create policy "Authenticated users can update sales" on public.sales for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete sales" on public.sales for delete to authenticated using (true);

create policy "Authenticated users can select sale_items" on public.sale_items for select to authenticated using (true);
create policy "Authenticated users can insert sale_items" on public.sale_items for insert to authenticated with check (true);
create policy "Authenticated users can update sale_items" on public.sale_items for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete sale_items" on public.sale_items for delete to authenticated using (true);


-- 3. Triggers for Stock Auto Update/Deduction

-- Trigger function for Purchases (Increases Stock)
create or replace function public.update_stock_on_purchase()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.products
    set stock_quantity = stock_quantity + NEW.quantity
    where id = NEW.product_id;
  elsif (TG_OP = 'UPDATE') then
    -- if quantity changes
    update public.products
    set stock_quantity = stock_quantity - OLD.quantity + NEW.quantity
    where id = NEW.product_id;
  elsif (TG_OP = 'DELETE') then
    update public.products
    set stock_quantity = stock_quantity - OLD.quantity
    where id = OLD.product_id;
  end if;
  return null;
end;
$$ language plpgsql security invoker;

create trigger trigger_update_stock_on_purchase
after insert or update or delete on public.purchase_items
for each row execute function public.update_stock_on_purchase();

-- Trigger function for Sales (Decreases Stock)
create or replace function public.update_stock_on_sale()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.products
    set stock_quantity = stock_quantity - NEW.quantity
    where id = NEW.product_id;
  elsif (TG_OP = 'UPDATE') then
    -- if quantity changes
    update public.products
    set stock_quantity = stock_quantity + OLD.quantity - NEW.quantity
    where id = NEW.product_id;
  elsif (TG_OP = 'DELETE') then
    update public.products
    set stock_quantity = stock_quantity + OLD.quantity
    where id = OLD.product_id;
  end if;
  return null;
end;
$$ language plpgsql security invoker;

create trigger trigger_update_stock_on_sale
after insert or update or delete on public.sale_items
for each row execute function public.update_stock_on_sale();


-- Trigger function to automatically insert into users table when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
