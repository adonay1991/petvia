-- PetVia Initial Database Schema
-- Veterinary Platform for Spain

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum types
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro');
CREATE TYPE price_visibility AS ENUM ('public', 'registered', 'premium');

-- ============================================
-- CLINICS TABLE
-- ============================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Basic info
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Location
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    province TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,

    -- Contact
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,

    -- Features
    is_24h BOOLEAN NOT NULL DEFAULT FALSE,
    has_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    -- Subscription
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Media
    logo_url TEXT,
    cover_image_url TEXT,

    -- Ratings (denormalized for performance)
    rating_average NUMERIC(2,1) NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0
);

-- Indexes for clinics
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_province ON clinics(province);
CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_clinics_location ON clinics USING GIST(location);
CREATE INDEX idx_clinics_emergency ON clinics(has_emergency) WHERE has_emergency = TRUE;
CREATE INDEX idx_clinics_24h ON clinics(is_24h) WHERE is_24h = TRUE;

-- ============================================
-- CLINIC OPENING HOURS TABLE
-- ============================================
CREATE TABLE clinic_opening_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
    opens_at TIME NOT NULL,
    closes_at TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,

    UNIQUE(clinic_id, day_of_week)
);

CREATE INDEX idx_clinic_hours_clinic ON clinic_opening_hours(clinic_id);

-- ============================================
-- SPECIALISTS TABLE
-- ============================================
CREATE TABLE specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT,
    bio TEXT,
    photo_url TEXT,

    -- AVEPA specialties (array of specialty names)
    avepa_specialties TEXT[] NOT NULL DEFAULT '{}',
    years_experience INTEGER,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_specialists_slug ON specialists(slug);
CREATE INDEX idx_specialists_specialties ON specialists USING GIN(avepa_specialties);

-- ============================================
-- CLINIC-SPECIALIST RELATIONSHIP TABLE
-- ============================================
CREATE TABLE clinic_specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    UNIQUE(clinic_id, specialist_id)
);

CREATE INDEX idx_clinic_specialists_clinic ON clinic_specialists(clinic_id);
CREATE INDEX idx_clinic_specialists_specialist ON clinic_specialists(specialist_id);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT
);

CREATE INDEX idx_services_category ON services(category);

-- ============================================
-- CLINIC-SERVICES RELATIONSHIP TABLE (with prices)
-- ============================================
CREATE TABLE clinic_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    price_min NUMERIC(10,2),
    price_max NUMERIC(10,2),
    price_visibility price_visibility NOT NULL DEFAULT 'public',

    UNIQUE(clinic_id, service_id)
);

CREATE INDEX idx_clinic_services_clinic ON clinic_services(clinic_id);
CREATE INDEX idx_clinic_services_service ON clinic_services(service_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Ratings (1-5)
    rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_staff INTEGER CHECK (rating_staff >= 1 AND rating_staff <= 5),
    rating_facilities INTEGER CHECK (rating_facilities >= 1 AND rating_facilities <= 5),
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),

    comment TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,

    -- One review per user per clinic
    UNIQUE(clinic_id, user_id)
);

CREATE INDEX idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = TRUE;

-- ============================================
-- POSTGIS FUNCTIONS
-- ============================================

-- Find nearby clinics within radius
CREATE OR REPLACE FUNCTION find_nearby_clinics(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10,
    emergency_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    is_24h BOOLEAN,
    has_emergency BOOLEAN,
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.slug,
        c.address,
        c.city,
        c.phone,
        c.is_24h,
        c.has_emergency,
        ST_Distance(
            c.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) / 1000 AS distance_km
    FROM clinics c
    WHERE
        ST_DWithin(
            c.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            radius_km * 1000
        )
        AND (NOT emergency_only OR c.has_emergency = TRUE OR c.is_24h = TRUE)
    ORDER BY distance_km ASC;
END;
$$;

-- Check if clinic is currently open
CREATE OR REPLACE FUNCTION is_clinic_open_now(clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_is_24h BOOLEAN;
    v_current_day INTEGER;
    v_current_time TIME;
    v_is_open BOOLEAN;
BEGIN
    -- Check if clinic is 24h
    SELECT is_24h INTO v_is_24h FROM clinics WHERE id = clinic_id;
    IF v_is_24h THEN
        RETURN TRUE;
    END IF;

    -- Get current day (0=Monday in our system, PostgreSQL DOW: 0=Sunday)
    v_current_day := EXTRACT(ISODOW FROM NOW()) - 1; -- Convert to 0-6 Monday-Sunday
    v_current_time := NOW()::TIME;

    -- Check opening hours
    SELECT
        NOT is_closed AND v_current_time >= opens_at AND v_current_time <= closes_at
    INTO v_is_open
    FROM clinic_opening_hours
    WHERE clinic_opening_hours.clinic_id = is_clinic_open_now.clinic_id AND day_of_week = v_current_day;

    RETURN COALESCE(v_is_open, FALSE);
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_specialists_updated_at
    BEFORE UPDATE ON specialists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Update clinic rating when review is added/updated
CREATE OR REPLACE FUNCTION update_clinic_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE clinics
    SET
        rating_average = COALESCE((
            SELECT AVG(rating_overall)::NUMERIC(2,1)
            FROM reviews
            WHERE clinic_id = COALESCE(NEW.clinic_id, OLD.clinic_id)
            AND is_approved = TRUE
        ), 0),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE clinic_id = COALESCE(NEW.clinic_id, OLD.clinic_id)
            AND is_approved = TRUE
        )
    WHERE id = COALESCE(NEW.clinic_id, OLD.clinic_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_clinic_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Clinics: Public read, owner can update
CREATE POLICY "Clinics are viewable by everyone"
    ON clinics FOR SELECT
    USING (true);

CREATE POLICY "Clinic owners can update their clinics"
    ON clinics FOR UPDATE
    USING (auth.uid() = owner_id);

-- Opening hours: Public read
CREATE POLICY "Opening hours are viewable by everyone"
    ON clinic_opening_hours FOR SELECT
    USING (true);

-- Specialists: Public read
CREATE POLICY "Specialists are viewable by everyone"
    ON specialists FOR SELECT
    USING (true);

-- Clinic-Specialists: Public read
CREATE POLICY "Clinic specialists are viewable by everyone"
    ON clinic_specialists FOR SELECT
    USING (true);

-- Services: Public read
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    USING (true);

-- Clinic services: Visibility based on price_visibility
CREATE POLICY "Clinic services visibility by tier"
    ON clinic_services FOR SELECT
    USING (
        price_visibility = 'public'
        OR (price_visibility = 'registered' AND auth.uid() IS NOT NULL)
        OR price_visibility = 'premium' -- TODO: Check user subscription
    );

-- Reviews: Only approved reviews are public, users can see their own
CREATE POLICY "Approved reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);
