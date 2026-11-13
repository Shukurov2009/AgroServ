-- AgroServ real backend schema (PostgreSQL / Neon)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  region text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','seller','worker','agronomist','admin')),
  password_hash text,
  google_id text UNIQUE,
  avatar_url text,
  avatar text NOT NULL DEFAULT '🌱',
  bio text NOT NULL DEFAULT '',
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','plus','pro')),
  plan_billing text,
  plan_expires_at timestamptz,
  wallet bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked')),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  user_agent text,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  price bigint NOT NULL CHECK (price >= 0),
  unit text NOT NULL DEFAULT 'dona',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description text NOT NULL DEFAULT '',
  region text,
  phone text,
  telegram text,
  emoji text NOT NULL DEFAULT '🌱',
  gradient text,
  image_url text,
  year integer,
  condition text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  sales integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','hidden','sold','blocked')),
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('worker','agronomist')),
  name text NOT NULL,
  age integer,
  experience integer NOT NULL DEFAULT 0,
  service_type text,
  equipment text,
  specialization text,
  education text,
  price bigint NOT NULL CHECK (price >= 0),
  unit text NOT NULL,
  region text,
  phone text,
  telegram text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  completed_orders integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  gradient text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','hidden','blocked')),
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  type text NOT NULL,
  location text,
  salary text,
  description text NOT NULL,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact text,
  applicants integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  channel text,
  category text,
  views text NOT NULL DEFAULT '0',
  duration text NOT NULL DEFAULT '-',
  emoji text,
  gradient text,
  youtube_id text,
  url text,
  description text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  buyer_id uuid NOT NULL REFERENCES users(id),
  seller_id uuid REFERENCES users(id),
  seller_ids uuid[] NOT NULL DEFAULT '{}',
  type text NOT NULL CHECK (type IN ('product','service')),
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'manual',
  payment_status text NOT NULL DEFAULT 'pending',
  subtotal bigint NOT NULL,
  delivery_fee bigint NOT NULL DEFAULT 0,
  discount bigint NOT NULL DEFAULT 0,
  total bigint NOT NULL,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  commission_amount bigint NOT NULL DEFAULT 0,
  address text,
  phone text,
  note text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  promo_code text,
  credited boolean NOT NULL DEFAULT false,
  refunded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount bigint NOT NULL,
  balance_after bigint,
  description text,
  reference text,
  provider text,
  provider_tx_id text,
  status text NOT NULL DEFAULT 'completed',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('plan','feature','wallet_topup','order')),
  reference text,
  amount bigint NOT NULL CHECK (amount >= 0),
  provider text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','failed')),
  provider_tx_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty integer NOT NULL CHECK (qty > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('product','service')),
  target_id uuid NOT NULL,
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscribers (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type text NOT NULL,
  number text NOT NULL,
  holder text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  code text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('percent','fixed')),
  value bigint NOT NULL,
  max_discount bigint,
  min_total bigint NOT NULL DEFAULT 0,
  scope text NOT NULL CHECK (scope IN ('order','plan','feature')),
  description text,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_usage (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day date NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','rejected')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS token_hash text;
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS used_at timestamptz;
CREATE INDEX IF NOT EXISTS password_resets_token_idx
  ON password_resets (token_hash) WHERE token_hash IS NOT NULL;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text NOT NULL DEFAULT '🌱';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('active','paused','hidden','sold','blocked'));
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_status_check;
ALTER TABLE services ADD CONSTRAINT services_status_check
  CHECK (status IN ('active','paused','hidden','blocked'));

CREATE INDEX IF NOT EXISTS products_seller_idx ON products(seller_id);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS services_user_idx ON services(user_id);
CREATE INDEX IF NOT EXISTS orders_buyer_idx ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_seller_idx ON orders(seller_id);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS reviews_target_idx ON reviews(target_type, target_id);
