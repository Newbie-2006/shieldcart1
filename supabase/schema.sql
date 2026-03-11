-- ============================================
-- ShieldCart — Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──
CREATE TABLE profiles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  role       TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'inspector', 'admin')),
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ORDERS ──
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL CHECK (platform IN ('Amazon', 'Flipkart', 'Meesho', 'Myntra', 'Nykaa')),
  product_url       TEXT,
  product_name      TEXT NOT NULL,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  shieldcart_fee    NUMERIC(10,2) NOT NULL DEFAULT 99,
  status            TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered','arrived','inspecting','passed','failed','dispatched','delivered')),
  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  razorpay_order_id TEXT,
  inspector_id      UUID REFERENCES profiles(id),
  delivery_address  TEXT,
  product_screenshot TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INSPECTIONS ──
CREATE TABLE inspections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  inspector_id  UUID NOT NULL REFERENCES profiles(id),
  status        TEXT CHECK (status IN ('passed','failed')),
  defects_found TEXT[],
  checklist     JSONB DEFAULT '{
    "packaging_intact": false,
    "correct_item": false,
    "no_defects": false,
    "serial_number_matches": false,
    "all_accessories_present": false
  }'::jsonb,
  notes         TEXT,
  inspected_at  TIMESTAMPTZ DEFAULT now()
);

-- ── INSPECTION PHOTOS ──
CREATE TABLE inspection_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  photo_url     TEXT NOT NULL,
  photo_type    TEXT NOT NULL CHECK (photo_type IN ('box_exterior','box_interior','product','serial_number','defect','return')),
  taken_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RETURNS ──
CREATE TABLE returns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','received','verifying','approved','rejected')),
  fraud_flag      BOOLEAN DEFAULT false,
  mismatch_notes  TEXT,
  verified_by     UUID REFERENCES profiles(id),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SUBSCRIPTIONS ──
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  razorpay_sub_id TEXT,
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at         TIMESTAMPTZ NOT NULL
);

-- ── BLACKLIST ──
CREATE TABLE blacklist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id),
  seller_name TEXT,
  reason      TEXT NOT NULL,
  flagged_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  flagged_by  UUID REFERENCES profiles(id)
);


-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- ── PROFILES POLICIES ──
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── ORDERS POLICIES ──
CREATE POLICY "Customers see own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Inspectors see assigned orders"
  ON orders FOR SELECT
  USING (auth.uid() = inspector_id);

CREATE POLICY "Admins see all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Inspectors can update assigned orders"
  ON orders FOR UPDATE
  USING (auth.uid() = inspector_id);

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── INSPECTIONS POLICIES ──
CREATE POLICY "Inspectors see own inspections"
  ON inspections FOR SELECT
  USING (auth.uid() = inspector_id);

CREATE POLICY "Customers see inspections for own orders"
  ON inspections FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = inspections.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins see all inspections"
  ON inspections FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Inspectors can insert inspections"
  ON inspections FOR INSERT
  WITH CHECK (auth.uid() = inspector_id);

CREATE POLICY "Inspectors can update own inspections"
  ON inspections FOR UPDATE
  USING (auth.uid() = inspector_id);

-- ── INSPECTION PHOTOS POLICIES ──
CREATE POLICY "Users can view photos for accessible inspections"
  ON inspection_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      JOIN orders o ON o.id = i.order_id
      WHERE i.id = inspection_photos.inspection_id
      AND (o.user_id = auth.uid() OR i.inspector_id = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Inspectors can insert photos"
  ON inspection_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections WHERE id = inspection_photos.inspection_id AND inspector_id = auth.uid()
    )
  );

-- ── RETURNS POLICIES ──
CREATE POLICY "Customers see own returns"
  ON returns FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = returns.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Inspectors see returns for assigned orders"
  ON returns FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = returns.order_id AND orders.inspector_id = auth.uid())
  );

CREATE POLICY "Admins see all returns"
  ON returns FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers can insert returns"
  ON returns FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = returns.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Inspectors and admins can update returns"
  ON returns FOR UPDATE
  USING (
    auth.uid() = verified_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── SUBSCRIPTIONS POLICIES ──
CREATE POLICY "Users see own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins see all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- ── BLACKLIST POLICIES ──
CREATE POLICY "Admins see blacklist"
  ON blacklist FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins and inspectors can insert blacklist"
  ON blacklist FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'inspector'))
  );


-- ============================================
-- ENABLE REALTIME ON ORDERS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;


-- ============================================
-- FUNCTION: Auto-update updated_at on orders
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
