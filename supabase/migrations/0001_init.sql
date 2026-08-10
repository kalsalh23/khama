-- Khama - Graduation Fashion Platform
-- Initial schema, RLS, storage, and seed data

create extension if not exists "pgcrypto";

-- ==================== ENUMS & SEQUENCES ====================
create type public.app_role as enum ('customer', 'admin', 'manager', 'production', 'shipping');
create type public.order_status as enum ('pending', 'confirmed', 'design_review', 'production', 'embroidery', 'ready', 'shipped', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'under_review');
create type public.receipt_status as enum ('under_review', 'approved', 'rejected');

create sequence if not exists public.order_number_seq;

create or replace function public.get_order_sequence()
returns bigint
language sql
as $$
  select nextval('public.order_number_seq');
$$;

-- ==================== PROFILES ====================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role public.app_role not null default 'customer',
  university text,
  college text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==================== PRODUCTS ====================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  material text,
  base_price numeric(10,2) not null default 0,
  category text not null default 'scarf',
  is_designable boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0
);

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  hex text not null,
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  type text not null default 'select',
  price_adjust numeric(10,2) not null default 0,
  is_required boolean not null default false,
  sort_order integer not null default 0
);

-- ==================== DESIGN OPTIONS ====================
create table public.embroidery_threads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  hex text not null,
  price_adjust numeric(10,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.fonts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  font_key text not null unique,
  type text not null default 'ar',
  css_family text,
  font_file_url text,
  preview_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.measurement_fields (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text not null,
  description text,
  image_url text,
  unit text not null default 'cm',
  is_required boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  product_ids text[]
);

create table public.user_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  values jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ==================== DESIGN / CART ====================
create table public.saved_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text,
  config jsonb not null,
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.saved_design_assets (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references public.saved_designs (id) on delete cascade,
  type text not null,
  url text not null,
  key text not null,
  x numeric not null default 0,
  y numeric not null default 0,
  scale numeric not null default 1,
  rotation numeric not null default 0,
  opacity numeric not null default 1,
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  design_config jsonb not null default '{}'::jsonb,
  preview_url text,
  measurements jsonb,
  created_at timestamptz not null default now()
);

-- ==================== COUPONS ====================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null default 'percent',
  value numeric(10,2) not null default 0,
  min_order_amount numeric(10,2),
  start_at timestamptz,
  end_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  product_ids text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ==================== ORDERS ====================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  university text,
  college text,
  department text,
  graduation_year text,
  status public.order_status not null default 'pending',
  items_total numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  currency text not null default 'SAR',
  notes text,
  coupon_id uuid references public.coupons (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.apply_coupon(code text, order_amount numeric, product_ids text[] default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  c public.coupons%rowtype;
begin
  select * into c from public.coupons
  where upper(code) = upper(apply_coupon.code) and is_active = true;
  if not found then
    return jsonb_build_object('valid', false, 'message', 'كود غير صالح');
  end if;
  if c.end_at is not null and c.end_at < now() then
    return jsonb_build_object('valid', false, 'message', 'انتهت صلاحية الكوبون');
  end if;
  if c.start_at is not null and c.start_at > now() then
    return jsonb_build_object('valid', false, 'message', 'الكوبون لم يبدأ بعد');
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    return jsonb_build_object('valid', false, 'message', 'تم استنفاد الكوبون');
  end if;
  if c.min_order_amount is not null and order_amount < c.min_order_amount then
    return jsonb_build_object('valid', false, 'message', 'الحد الأدنى للطلب ' || c.min_order_amount);
  end if;
  return jsonb_build_object('valid', true, 'type', c.type, 'value', c.value, 'coupon_id', c.id);
end;
$$;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  design_config jsonb,
  preview_url text,
  measurements jsonb
);

create table public.order_customizations (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  key text not null,
  label text not null,
  value text not null,
  price_adjust numeric(10,2) not null default 0
);

create table public.order_measurements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  field_name text not null,
  field_name_en text not null default '',
  value numeric not null,
  unit text not null default 'cm'
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ==================== PAYMENTS ====================
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  type text not null default 'bank_transfer',
  description text,
  instructions text,
  config jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  method_id uuid references public.payment_methods (id) on delete set null,
  method_name text,
  amount numeric(10,2) not null default 0,
  status public.payment_status not null default 'pending',
  transaction_id text,
  receipt_url text,
  gateway_payload jsonb,
  created_at timestamptz not null default now()
);

create table public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  file_url text not null,
  file_key text not null,
  status public.receipt_status not null default 'under_review',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ==================== SHIPPING ====================
create table public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  city text not null,
  region text not null,
  detailed_address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  status text,
  address_json jsonb
);

-- ==================== NOTIFICATIONS & SOCIAL ====================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ==================== CONTENT ====================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

-- ==================== ADMIN ====================
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles (id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ==================== INDEXES ====================
create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created on public.orders (created_at desc);
create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_payments_order on public.payments (order_id);
create index if not exists idx_notifications_user on public.notifications (user_id);
create index if not exists idx_saved_designs_user on public.saved_designs (user_id);
create index if not exists idx_product_colors_product on public.product_colors (product_id);
create index if not exists idx_product_images_product on public.product_images (product_id);
