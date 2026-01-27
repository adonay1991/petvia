-- PetVia Seed Data
-- Sample data for local development

-- ============================================
-- SERVICES (Common veterinary services)
-- ============================================
INSERT INTO services (name, slug, category, description) VALUES
-- Consultas
('Consulta general', 'consulta-general', 'consultas', 'Revisión general y diagnóstico'),
('Consulta de urgencia', 'consulta-urgencia', 'consultas', 'Atención de emergencias'),
('Segunda opinión', 'segunda-opinion', 'consultas', 'Evaluación de diagnóstico previo'),

-- Vacunas
('Vacuna polivalente perro', 'vacuna-polivalente-perro', 'vacunas', 'Moquillo, parvovirosis, hepatitis, leptospirosis'),
('Vacuna rabia', 'vacuna-rabia', 'vacunas', 'Vacunación antirrábica'),
('Vacuna triple felina', 'vacuna-triple-felina', 'vacunas', 'Panleucopenia, rinotraqueitis, calicivirus'),
('Vacuna leucemia felina', 'vacuna-leucemia-felina', 'vacunas', 'FeLV'),

-- Cirugía
('Castración perro macho', 'castracion-perro-macho', 'cirugía', 'Orquiectomía canina'),
('Castración perro hembra', 'castracion-perro-hembra', 'cirugía', 'Ovariohisterectomía canina'),
('Castración gato macho', 'castracion-gato-macho', 'cirugía', 'Orquiectomía felina'),
('Castración gato hembra', 'castracion-gato-hembra', 'cirugía', 'Ovariohisterectomía felina'),

-- Diagnóstico
('Análisis de sangre completo', 'analisis-sangre', 'diagnóstico', 'Hemograma y bioquímica'),
('Radiografía', 'radiografia', 'diagnóstico', 'Diagnóstico por imagen rayos X'),
('Ecografía', 'ecografia', 'diagnóstico', 'Diagnóstico por ultrasonido'),

-- Odontología
('Limpieza dental', 'limpieza-dental', 'odontología', 'Profilaxis dental con anestesia'),
('Extracción dental', 'extraccion-dental', 'odontología', 'Extracción de piezas dentales'),

-- Identificación
('Microchip', 'microchip', 'identificación', 'Implantación de microchip identificativo');

-- ============================================
-- SAMPLE CLINICS (Madrid area)
-- ============================================
INSERT INTO clinics (
    name, slug, description, address, city, postal_code, province,
    location, phone, email, website, is_24h, has_emergency, is_verified,
    subscription_tier
) VALUES
(
    'Hospital Veterinario 24h Madrid',
    'hospital-veterinario-24h-madrid',
    'Hospital veterinario de referencia con servicio de urgencias 24 horas. Contamos con especialistas en todas las áreas.',
    'Calle Gran Vía 50',
    'Madrid',
    '28013',
    'Madrid',
    ST_SetSRID(ST_MakePoint(-3.7037, 40.4200), 4326),
    '911234567',
    'info@hospital24h.es',
    'https://hospital24h.es',
    TRUE,
    TRUE,
    TRUE,
    'pro'
),
(
    'Clínica Veterinaria El Retiro',
    'clinica-veterinaria-el-retiro',
    'Clínica veterinaria familiar con más de 20 años de experiencia. Especialistas en medicina felina.',
    'Calle Alcalá 150',
    'Madrid',
    '28028',
    'Madrid',
    ST_SetSRID(ST_MakePoint(-3.6697, 40.4222), 4326),
    '912345678',
    'contacto@vetretiro.es',
    'https://vetretiro.es',
    FALSE,
    TRUE,
    TRUE,
    'premium'
),
(
    'Centro Veterinario Chamberí',
    'centro-veterinario-chamberi',
    'Atención veterinaria de calidad en el corazón de Chamberí. Servicios de peluquería canina.',
    'Calle Santa Engracia 80',
    'Madrid',
    '28010',
    'Madrid',
    ST_SetSRID(ST_MakePoint(-3.6978, 40.4350), 4326),
    '913456789',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    'free'
),
(
    'Urgencias Veterinarias Sur',
    'urgencias-veterinarias-sur',
    'Servicio de urgencias veterinarias en la zona sur de Madrid. Abierto noches y festivos.',
    'Avenida de Oporto 25',
    'Madrid',
    '28026',
    'Madrid',
    ST_SetSRID(ST_MakePoint(-3.7189, 40.3878), 4326),
    '914567890',
    'urgencias@vetsur.es',
    NULL,
    FALSE,
    TRUE,
    FALSE,
    'premium'
);

-- ============================================
-- SAMPLE CLINIC OPENING HOURS
-- ============================================
-- Hospital 24h - Always open (but we add entries for display)
INSERT INTO clinic_opening_hours (clinic_id, day_of_week, opens_at, closes_at, is_closed)
SELECT id, day, '00:00'::TIME, '23:59'::TIME, FALSE
FROM clinics, generate_series(0, 6) AS day
WHERE slug = 'hospital-veterinario-24h-madrid';

-- Clínica El Retiro - Standard hours
INSERT INTO clinic_opening_hours (clinic_id, day_of_week, opens_at, closes_at, is_closed)
SELECT id, day,
    CASE WHEN day = 6 THEN '10:00'::TIME ELSE '09:00'::TIME END,
    CASE WHEN day = 6 THEN '14:00'::TIME WHEN day = 5 THEN '20:00'::TIME ELSE '21:00'::TIME END,
    day = 6 -- Closed on Sundays (day 6)
FROM clinics, generate_series(0, 6) AS day
WHERE slug = 'clinica-veterinaria-el-retiro';

-- Centro Chamberí - Standard hours
INSERT INTO clinic_opening_hours (clinic_id, day_of_week, opens_at, closes_at, is_closed)
SELECT id, day, '10:00'::TIME, '20:00'::TIME, day IN (5, 6) -- Closed weekends
FROM clinics, generate_series(0, 6) AS day
WHERE slug = 'centro-veterinario-chamberi';

-- Urgencias Sur - Evenings and weekends
INSERT INTO clinic_opening_hours (clinic_id, day_of_week, opens_at, closes_at, is_closed)
SELECT id, day,
    CASE WHEN day IN (5, 6) THEN '09:00'::TIME ELSE '18:00'::TIME END,
    '02:00'::TIME,
    FALSE
FROM clinics, generate_series(0, 6) AS day
WHERE slug = 'urgencias-veterinarias-sur';

-- ============================================
-- SAMPLE SPECIALISTS
-- ============================================
INSERT INTO specialists (name, slug, title, bio, avepa_specialties, years_experience, is_verified) VALUES
(
    'Dra. María García López',
    'maria-garcia-lopez',
    'Diplomada ECVIM-CA (Cardiología)',
    'Especialista en cardiología veterinaria con formación en el Royal Veterinary College de Londres.',
    ARRAY['Cardiología'],
    15,
    TRUE
),
(
    'Dr. Carlos Rodríguez Martín',
    'carlos-rodriguez-martin',
    'Diplomado ECVD (Dermatología)',
    'Especialista en dermatología y alergias veterinarias. Miembro de AVEPA.',
    ARRAY['Dermatología'],
    12,
    TRUE
),
(
    'Dra. Ana Fernández Ruiz',
    'ana-fernandez-ruiz',
    'Diplomada ECVN (Neurología)',
    'Especialista en neurología y neurocirugía veterinaria.',
    ARRAY['Neurología', 'Cirugía'],
    10,
    TRUE
),
(
    'Dr. Pablo Sánchez Moreno',
    'pablo-sanchez-moreno',
    'Especialista en Medicina Felina',
    'Dedicación exclusiva a medicina felina. Acreditado ISFM.',
    ARRAY['Medicina Felina', 'Medicina Interna'],
    8,
    FALSE
);

-- ============================================
-- LINK SPECIALISTS TO CLINICS
-- ============================================
INSERT INTO clinic_specialists (clinic_id, specialist_id, is_primary)
SELECT c.id, s.id, TRUE
FROM clinics c, specialists s
WHERE c.slug = 'hospital-veterinario-24h-madrid'
AND s.slug IN ('maria-garcia-lopez', 'ana-fernandez-ruiz');

INSERT INTO clinic_specialists (clinic_id, specialist_id, is_primary)
SELECT c.id, s.id, TRUE
FROM clinics c, specialists s
WHERE c.slug = 'clinica-veterinaria-el-retiro'
AND s.slug = 'pablo-sanchez-moreno';

INSERT INTO clinic_specialists (clinic_id, specialist_id, is_primary)
SELECT c.id, s.id, FALSE
FROM clinics c, specialists s
WHERE c.slug = 'hospital-veterinario-24h-madrid'
AND s.slug = 'carlos-rodriguez-martin';

-- ============================================
-- SAMPLE CLINIC SERVICES WITH PRICES
-- ============================================
-- Hospital 24h - All services, premium pricing
INSERT INTO clinic_services (clinic_id, service_id, price_min, price_max, price_visibility)
SELECT c.id, s.id,
    CASE s.category
        WHEN 'consultas' THEN 45
        WHEN 'vacunas' THEN 35
        WHEN 'cirugía' THEN 200
        WHEN 'diagnóstico' THEN 70
        WHEN 'odontología' THEN 150
        WHEN 'identificación' THEN 40
    END,
    CASE s.category
        WHEN 'consultas' THEN 80
        WHEN 'vacunas' THEN 65
        WHEN 'cirugía' THEN 450
        WHEN 'diagnóstico' THEN 150
        WHEN 'odontología' THEN 300
        WHEN 'identificación' THEN 50
    END,
    'public'
FROM clinics c, services s
WHERE c.slug = 'hospital-veterinario-24h-madrid';

-- Clínica El Retiro - Standard pricing
INSERT INTO clinic_services (clinic_id, service_id, price_min, price_max, price_visibility)
SELECT c.id, s.id,
    CASE s.category
        WHEN 'consultas' THEN 35
        WHEN 'vacunas' THEN 30
        WHEN 'cirugía' THEN 150
        WHEN 'diagnóstico' THEN 55
        WHEN 'odontología' THEN 120
        WHEN 'identificación' THEN 35
    END,
    CASE s.category
        WHEN 'consultas' THEN 50
        WHEN 'vacunas' THEN 55
        WHEN 'cirugía' THEN 350
        WHEN 'diagnóstico' THEN 100
        WHEN 'odontología' THEN 220
        WHEN 'identificación' THEN 45
    END,
    'registered'
FROM clinics c, services s
WHERE c.slug = 'clinica-veterinaria-el-retiro';

-- Centro Chamberí - Budget pricing (only basic services)
INSERT INTO clinic_services (clinic_id, service_id, price_min, price_max, price_visibility)
SELECT c.id, s.id,
    CASE s.category
        WHEN 'consultas' THEN 25
        WHEN 'vacunas' THEN 25
        WHEN 'identificación' THEN 30
    END,
    CASE s.category
        WHEN 'consultas' THEN 40
        WHEN 'vacunas' THEN 45
        WHEN 'identificación' THEN 40
    END,
    'public'
FROM clinics c, services s
WHERE c.slug = 'centro-veterinario-chamberi'
AND s.category IN ('consultas', 'vacunas', 'identificación');
