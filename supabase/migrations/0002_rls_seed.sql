-- RLS policies, storage buckets, and seed data

-- ==================== HELPER FUNCTIONS ====================
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'manager')
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'manager', 'production', 'shipping')
  );
$$;

-- ==================== RLS ENABLE ====================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_options enable row level security;
alter table public.embroidery_threads enable row level security;
alter table public.fonts enable row level security;
alter table public.measurement_fields enable row level security;
alter table public.user_measurements enable row level security;
alter table public.saved_designs enable row level security;
alter table public.saved_design_assets enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_customizations enable row level security;
alter table public.order_measurements enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_methods enable row level security;
alter table public.payments enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.shipping_addresses enable row level security;
alter table public.shipments enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.faqs enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.settings enable row level security;

-- ==================== PROFILES ====================
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ==================== PRODUCTS (public read, staff write) ====================
create policy "products_select" on public.products for select using (true);
create policy "products_admin" on public.products for all using (public.is_staff()) with check (public.is_staff());

create policy "product_images_select" on public.product_images for select using (true);
create policy "product_images_admin" on public.product_images for all using (public.is_staff()) with check (public.is_staff());

create policy "product_colors_select" on public.product_colors for select using (true);
create policy "product_colors_admin" on public.product_colors for all using (public.is_staff()) with check (public.is_staff());

create policy "product_options_select" on public.product_options for select using (true);
create policy "product_options_admin" on public.product_options for all using (public.is_staff()) with check (public.is_staff());

-- ==================== DESIGN OPTIONS ====================
create policy "threads_select" on public.embroidery_threads for select using (true);
create policy "threads_admin" on public.embroidery_threads for all using (public.is_staff()) with check (public.is_staff());

create policy "fonts_select" on public.fonts for select using (true);
create policy "fonts_admin" on public.fonts for all using (public.is_staff()) with check (public.is_staff());

create policy "measurement_fields_select" on public.measurement_fields for select using (true);
create policy "measurement_fields_admin" on public.measurement_fields for all using (public.is_staff()) with check (public.is_staff());

create policy "user_measurements_owner" on public.user_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ==================== DESIGN / CART ====================
create policy "saved_designs_owner" on public.saved_designs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_assets_via_design" on public.saved_design_assets
  for all using (
    exists (select 1 from public.saved_designs d where d.id = design_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.saved_designs d where d.id = design_id and d.user_id = auth.uid())
  );

create policy "carts_owner" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cart_items_via_cart" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- ==================== ORDERS ====================
create policy "orders_select" on public.orders
  for select using (auth.uid() = user_id or public.is_staff());
create policy "orders_insert" on public.orders for insert with check (true);
create policy "orders_admin_update" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());

create policy "order_items_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
  );
create policy "order_items_insert" on public.order_items for insert with check (true);

create policy "order_customizations_select" on public.order_customizations
  for select using (
    exists (
      select 1 from public.order_items i join public.orders o on o.id = i.order_id
      where i.id = order_item_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );
create policy "order_customizations_insert" on public.order_customizations for insert with check (true);

create policy "order_measurements_select" on public.order_measurements
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
  );
create policy "order_measurements_insert" on public.order_measurements for insert with check (true);

create policy "order_status_history_select" on public.order_status_history
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
  );
create policy "order_status_history_admin" on public.order_status_history for insert with check (public.is_staff());

-- ==================== PAYMENTS ====================
create policy "payment_methods_select" on public.payment_methods for select using (true);
create policy "payment_methods_admin" on public.payment_methods for all using (public.is_staff()) with check (public.is_staff());

create policy "payments_select" on public.payments
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
  );
create policy "payments_insert" on public.payments for insert with check (true);
create policy "payments_admin_update" on public.payments for update using (public.is_staff()) with check (public.is_staff());

create policy "payment_receipts_select" on public.payment_receipts
  for select using (
    exists (
      select 1 from public.payments p join public.orders o on o.id = p.order_id
      where p.id = payment_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );
create policy "payment_receipts_insert" on public.payment_receipts for insert with check (true);
create policy "payment_receipts_admin" on public.payment_receipts for update using (public.is_staff()) with check (public.is_staff());

-- ==================== SHIPPING ====================
create policy "addresses_owner" on public.shipping_addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "shipments_select" on public.shipments
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
  );
create policy "shipments_insert" on public.shipments for insert with check (true);
create policy "shipments_admin" on public.shipments for update using (public.is_staff()) with check (public.is_staff());

-- ==================== COUPONS ====================
create policy "coupons_admin" on public.coupons for all using (public.is_staff()) with check (public.is_staff());
create policy "coupon_usages_admin" on public.coupon_usages for all using (public.is_staff()) with check (public.is_staff());
create policy "coupon_usages_insert" on public.coupon_usages for insert with check (true);

-- ==================== NOTIFICATIONS & SOCIAL ====================
create policy "notifications_owner" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = user_id);

-- ==================== CONTENT ====================
create policy "blog_select" on public.blog_posts for select using (is_published = true or public.is_staff());
create policy "blog_admin" on public.blog_posts for all using (public.is_staff()) with check (public.is_staff());

create policy "faqs_select" on public.faqs for select using (true);
create policy "faqs_admin" on public.faqs for all using (public.is_staff()) with check (public.is_staff());

-- ==================== ADMIN ====================
create policy "admin_users_select" on public.admin_users for select using (public.is_admin());
create policy "admin_users_admin" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_logs_admin" on public.admin_activity_logs for all using (public.is_admin()) with check (public.is_admin());

create policy "settings_select" on public.settings for select using (true);
create policy "settings_admin" on public.settings for all using (public.is_staff()) with check (public.is_staff());

-- ==================== STORAGE BUCKETS ====================
insert into storage.buckets (id, name, public) values
  ('design-assets', 'design-assets', true),
  ('design-previews', 'design-previews', true),
  ('products', 'products', true),
  ('product-colors', 'product-colors', true),
  ('blog', 'blog', true),
  ('avatars', 'avatars', true),
  ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

-- Storage policies
create policy "public_read_design_assets" on storage.objects for select
  using (bucket_id = 'design-assets');
create policy "auth_write_design_assets" on storage.objects for insert
  with check (bucket_id = 'design-assets' and auth.role() = 'authenticated');

create policy "public_read_design_previews" on storage.objects for select
  using (bucket_id = 'design-previews');
create policy "auth_write_design_previews" on storage.objects for insert
  with check (bucket_id = 'design-previews' and auth.role() = 'authenticated');

create policy "public_read_products" on storage.objects for select
  using (bucket_id = 'products');
create policy "staff_write_products" on storage.objects for insert
  with check (bucket_id = 'products' and public.is_staff());
create policy "staff_update_products" on storage.objects for update
  using (bucket_id = 'products' and public.is_staff()) with check (bucket_id = 'products' and public.is_staff());
create policy "staff_delete_products" on storage.objects for delete
  using (bucket_id = 'products' and public.is_staff());

create policy "public_read_product_colors" on storage.objects for select
  using (bucket_id = 'product-colors');
create policy "staff_write_product_colors" on storage.objects for insert
  with check (bucket_id = 'product-colors' and public.is_staff());

create policy "public_read_blog" on storage.objects for select
  using (bucket_id = 'blog');
create policy "staff_write_blog" on storage.objects for insert
  with check (bucket_id = 'blog' and public.is_staff());

create policy "public_read_avatars" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "auth_write_avatars" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- payment-receipts is private; access via signed URLs with owner/staff check
create policy "auth_owner_write_receipts" on storage.objects for insert
  with check (bucket_id = 'payment-receipts' and auth.role() = 'authenticated');
create policy "owner_read_receipts" on storage.objects for select
  using (
    bucket_id = 'payment-receipts' and (
      public.is_staff() or
      exists (
        select 1 from storage.objects o
        where o.id = storage.objects.id and o.owner_id = auth.uid()::text
      )
    )
  );

-- ==================== SEED: PRODUCTS ====================
insert into public.products (name, slug, description, material, base_price, category, is_designable, sort_order) values
  ('وشاح التخرج', 'graduation-scarf', 'وشاح تخرج مطرز بخيوط ذهبية واسمك مطرز عليه مع سنة التخرج وشعار جامعتك، بتصميم فردي خاص بك.', 'مخمل فاخر + خيط ذهبي', 180, 'scarf', true, 1),
  ('عباءة التخرج', 'graduation-robe', 'عباءة تخرج كاملة بجودة عالية مع تطريز شخصي لاسمك وتفاصيل جامعتك.', 'قماش عالي الجودة', 320, 'robe', true, 2),
  ('قبعة التخرج', 'graduation-cap', 'قبعة تخرج مع شرابة حريرية، يمكن تخصيصها بألوان جامعتك وسنة التخرج.', 'قماش + شرابة حرير', 60, 'cap', true, 3),
  ('الطقم الكامل', 'graduation-set', 'الطقم الكامل: وشاح + عباءة + قبعة، بتصميم موحد ومتناسق مع تطريز شخصي.', 'طقم كامل', 520, 'set', true, 4)
on conflict (slug) do nothing;

-- Scarf colors
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.sort_order
from public.products p
cross join (values
  ('أسود', '#1c1c1c', 1),
  ('أبيض', '#f5f5f0', 2),
  ('كحلي', '#1a2639', 3),
  ('ماروني', '#6b1f2a', 4),
  ('أخضر', '#1d5c3f', 5),
  ('بنفسجي', '#4a2c6e', 6),
  ('بيج', '#d8c5a0', 7),
  ('رمادي', '#8a8a8f', 8)
) as c(name, hex, sort_order)
where p.slug = 'graduation-scarf'
on conflict do nothing;

-- ==================== SEED: DESIGN OPTIONS ====================
insert into public.fonts (name, font_key, type, css_family, sort_order) values
  ('خط عربي كلاسيكي', 'font-ar-classic', 'ar', 'Amiri, serif', 1),
  ('خط عربي فاخر', 'font-ar-luxury', 'ar', 'Reem Kufi, ''Noto Naskh Arabic'', serif', 2),
  ('خط عربي بسيط', 'font-ar-simple', 'ar', 'Cairo, ''IBM Plex Sans Arabic'', sans-serif', 3),
  ('خط إنجليزي كلاسيكي', 'font-en-classic', 'en', 'Playfair Display, ''Times New Roman'', serif', 4),
  ('خط إنجليزي عصري', 'font-en-modern', 'en', 'Montserrat, ''Segoe UI'', sans-serif', 5)
on conflict (font_key) do nothing;

insert into public.embroidery_threads (name, name_en, hex, price_adjust, sort_order) values
  ('ذهبي', 'Gold', '#d4af37', 0, 1),
  ('فضي', 'Silver', '#c0c0c8', 0, 2),
  ('أبيض', 'White', '#ffffff', 0, 3),
  ('أسود', 'Black', '#111111', 0, 4),
  ('أحمر', 'Red', '#b91c1c', 5, 5),
  ('أزرق', 'Blue', '#1d4ed8', 5, 6)
on conflict do nothing;

insert into public.measurement_fields (name, name_en, description, unit, is_required, sort_order, product_ids) values
  ('طول الكتف', 'Shoulder Length', 'من نهاية الكتف الأيسر إلى نهاية الكتف الأيمن', 'cm', true, 1, null),
  ('طول الأكمام', 'Sleeve Length', 'من نهاية الكتف إلى رسغ اليد', 'cm', true, 2, null),
  ('عرض الكتفين', 'Shoulder Width', 'عرض الكتفين من الأمام', 'cm', true, 3, null),
  ('محيط الصدر', 'Chest Circumference', 'حول أوسع جزء من الصدر', 'cm', true, 4, null),
  ('الطول الكلي', 'Total Length', 'الطول الكامل للعباءة', 'cm', true, 5, null),
  ('محيط الخصر', 'Waist Circumference', 'حول الخصر', 'cm', false, 6, null)
on conflict do nothing;

-- ==================== SEED: PAYMENT METHODS ====================
insert into public.payment_methods (name, name_en, type, description, instructions, sort_order) values
  ('الدفع عند الاستلام', 'Cash on Delivery', 'cod', 'ادفع نقداً عند استلام طلبك', 'سيتم الدفع نقداً عند استلام الطلب', 1),
  ('تحويل بنكي', 'Bank Transfer', 'bank_transfer', 'حوّل المبلغ لحسابنا البنكي ثم ارفع إيصال التحويل', 'حساب بنكي: STB 1234-5678-90\nالاسم: مؤسسة خاما للتخرج', 2),
  ('مدى', 'Mada', 'mada', 'ادفع عبر شبكة مدى المحلية', 'سيتم توجيهك لصفحة الدفع الآمن', 3),
  ('بطاقة Visa', 'Visa Card', 'card', 'ادفع عبر بطاقة Visa', 'سيتم توجيهك لصفحة الدفع الآمن', 4)
on conflict do nothing;

-- ==================== SEED: FAQS ====================
insert into public.faqs (question, answer, sort_order) values
  ('كيف أطلب وشاح تخرج مخصص؟', 'اختر المنتج ثم ادخل على المصمم، حدد ألوانك واكتب اسمك وسنة التخرج، أضف المنتج للسلة وأكمل الطلب مع قياساتك.', 1),
  ('كم يستغرق تنفيذ الطلب؟', 'عادة من 5 إلى 10 أيام عمل حسب تعقيد التصميم والكمية.', 2),
  ('هل يمكنني تعديل تصميمي بعد الطلب؟', 'نعم، يمكنك طلب التعديل قبل مرحلة الإنتاج النهائي من خلال التواصل معنا.', 3),
  ('كيف أدفع؟', 'نوفر الدفع عند الاستلام، التحويل البنكي، مدى، وبطاقات الائتمان.', 4)
on conflict do nothing;

-- ==================== SEED: SETTINGS ====================
insert into public.settings (key, value) values
  ('shipping_fee', '{"value": 40}'),
  ('free_shipping_threshold', '{"value": 500}'),
  ('currency', '{"value": "SAR"}'),
  ('site_name', '{"value": "خاما"}'),
  ('site_tagline', '{"value": "هويتك تبدأ من تفاصيلك"}'),
  ('support_phone', '{"value": "0550000000"}'),
  ('support_email', '{"value": "support@khama.sa"}'),
  ('contact_address', '{"value": "الرياض، المملكة العربية السعودية"}')
on conflict (key) do nothing;

-- ==================== ADMIN BOOTSTRAP NOTE ====================
-- To promote a user to admin, run:
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
