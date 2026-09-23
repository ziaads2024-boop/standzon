-- Migration: Enable public read for exhibition calendar
-- Allows anon users to read active exhibitions, countries, cities for calendar
-- Service role still bypasses RLS for writes

-- Exhibitions: public can read active rows
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active exhibitions" ON exhibitions;
CREATE POLICY "Public can read active exhibitions"
  ON exhibitions FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Service role can do all on exhibitions" ON exhibitions;
CREATE POLICY "Service role can do all on exhibitions"
  ON exhibitions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Countries: public read for active
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active countries" ON countries;
CREATE POLICY "Public can read active countries"
  ON countries FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Service role can do all on countries" ON countries;
CREATE POLICY "Service role can do all on countries"
  ON countries FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Cities: public read for active
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active cities" ON cities;
CREATE POLICY "Public can read active cities"
  ON cities FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Service role can do all on cities" ON cities;
CREATE POLICY "Service role can do all on cities"
  ON cities FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Trade shows: public read
ALTER TABLE trade_shows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read trade shows" ON trade_shows;
CREATE POLICY "Public can read trade shows"
  ON trade_shows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can do all on trade_shows" ON trade_shows;
CREATE POLICY "Service role can do all on trade_shows"
  ON trade_shows FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
