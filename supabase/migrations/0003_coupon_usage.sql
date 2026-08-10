-- Increment coupon usage count
create or replace function public.increment_coupon_usage(p_coupon_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.coupons set used_count = used_count + 1 where id = p_coupon_id;
end;
$$;
