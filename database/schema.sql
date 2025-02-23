-- Create tables for the STS bus tracking system

-- Drivers table with minimal required columns
CREATE TABLE drivers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    auth_id UUID UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE buses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    last_maintenance_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    route_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    estimated_duration INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    driver_id BIGINT REFERENCES drivers(id),
    bus_id BIGINT REFERENCES buses(id),
    route_id BIGINT REFERENCES routes(id),
    status VARCHAR(20) DEFAULT 'scheduled',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Location history table
CREATE TABLE location_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id BIGINT REFERENCES trips(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE incidents (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id BIGINT REFERENCES trips(id),
    driver_id BIGINT REFERENCES drivers(id),
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'reported',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suggestions table
CREATE TABLE suggestions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    driver_id BIGINT REFERENCES drivers(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prayer breaks table
CREATE TABLE prayer_breaks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    driver_id BIGINT REFERENCES drivers(id),
    prayer_time VARCHAR(20) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_drivers_email ON drivers(email);
CREATE INDEX idx_drivers_auth_id ON drivers(auth_id);

-- Insert sample data for testing
INSERT INTO drivers (name, email, license_number, auth_id) VALUES
('Ahmed Ben Ali', 'ahmed.benali@sts.tn', 'DL123456', gen_random_uuid()),
('Fatima Mansour', 'fatima.mansour@sts.tn', 'DL234567', gen_random_uuid()),
('Mohamed Trabelsi', 'mohamed.trabelsi@sts.tn', 'DL345678', gen_random_uuid()),
('Youssef Gharbi', 'youssef.gharbi@sts.tn', 'DL456789', gen_random_uuid()),
('Amira Bouazizi', 'amira.bouazizi@sts.tn', 'DL567890', gen_random_uuid()),
('Karim Mejri', 'karim.mejri@sts.tn', 'DL678901', gen_random_uuid()),
('Leila Hamdi', 'leila.hamdi@sts.tn', 'DL789012', gen_random_uuid()),
('Sami Bouslama', 'sami.bouslama@sts.tn', 'DL890123', gen_random_uuid()),
('Nour Belhadj', 'nour.belhadj@sts.tn', 'DL901234', gen_random_uuid()),
('Rania Chaari', 'rania.chaari@sts.tn', 'DL012345', gen_random_uuid()),
('Slim Abidi', 'slim.abidi@sts.tn', 'DL123789', gen_random_uuid()),
('Ines Maaloul', 'ines.maaloul@sts.tn', 'DL234890', gen_random_uuid()),
('Hedi Bouazizi', 'hedi.bouazizi@sts.tn', 'DL345901', gen_random_uuid()),
('Asma Ghariani', 'asma.ghariani@sts.tn', 'DL456012', gen_random_uuid()),
('Zied Mejri', 'zied.mejri@sts.tn', 'DL567123', gen_random_uuid()),
('Mariem Belkadhi', 'mariem.belkadhi@sts.tn', 'DL678234', gen_random_uuid());


-- Sample buses
INSERT INTO buses (registration_number, model, capacity) VALUES
('TN 123 456', 'Mercedes-Benz O530', 45),
('TN 234 567', 'Volvo 7900', 40),
('TN 345 678', 'MAN Lion''s City', 42),
('TN 456 789', 'Mercedes-Benz O530', 45),
('TN 567 890', 'Volvo 7900', 40),
('TN 678 901', 'MAN Lion''s City', 42),
('TN 789 012', 'Mercedes-Benz Citaro', 38);

-- Sample routes
INSERT INTO routes (route_number, name, start_location, end_location, estimated_duration) VALUES
('R001', 'Centre Ville - La Marsa', 'Avenue Habib Bourguiba', 'La Marsa', 45),
('R002', 'Ariana - El Manar', 'Ariana Centre', 'Campus El Manar', 30),
('R003', 'Lac 1 - Lac 2', 'Lac 1', 'Lac 2', 20),
('R004', 'Bardo - Carthage', 'Bardo Museum', 'Carthage Archaeological Site', 35),
('R005', 'Tunis Marine - Gammarth', 'Tunis Marine', 'Gammarth', 40),
('R006', 'Menzah - Lac 3', 'Menzah 1', 'Lac 3', 25);

-- Sample trips
INSERT INTO trips (driver_id, bus_id, route_id, status, start_time, end_time)
SELECT 
    d.id,
    b.id,
    r.id,
    'in_progress',
    CURRENT_TIMESTAMP - interval '2 hours',
    CURRENT_TIMESTAMP + interval '1 hour'
FROM drivers d, buses b, routes r
LIMIT 3;

-- Additional scheduled trips
INSERT INTO trips (driver_id, bus_id, route_id, status, start_time, end_time)
SELECT 
    d.id,
    b.id,
    r.id,
    'scheduled',
    CURRENT_TIMESTAMP + interval '1 day',
    CURRENT_TIMESTAMP + interval '1 day 2 hours'
FROM drivers d, buses b, routes r
WHERE d.name LIKE 'Youssef%' OR d.name LIKE 'Amira%'
LIMIT 2;

-- Sample incidents
INSERT INTO incidents (trip_id, driver_id, type, description, status, latitude, longitude) 
SELECT 
    t.id,
    t.driver_id,
    'mechanical',
    'Engine overheating warning',
    'resolved',
    36.8065,
    10.1815
FROM trips t
LIMIT 1;

-- Additional incident
INSERT INTO incidents (trip_id, driver_id, type, description, status, latitude, longitude)
SELECT 
    t.id,
    t.driver_id,
    'traffic',
    'Heavy traffic due to construction work',
    'active',
    36.8167,
    10.1667
FROM trips t
LIMIT 1;

-- Sample location history
INSERT INTO location_history (trip_id, latitude, longitude)
SELECT 
    t.id,
    36.8065 + (random() * 0.01),
    10.1815 + (random() * 0.01)
FROM trips t
CROSS JOIN generate_series(1, 5);

-- Sample suggestions
INSERT INTO suggestions (driver_id, type, title, description, status)
SELECT 
    d.id,
    'route_improvement',
    'Alternative route for rush hour',
    'Suggest using Avenue Mohamed V during peak hours to avoid traffic',
    'under_review'
FROM drivers d
LIMIT 2;

-- Additional suggestions
INSERT INTO suggestions (driver_id, type, title, description, status)
SELECT 
    d.id,
    'safety_improvement',
    'Additional safety mirrors at sharp turns',
    'Installing safety mirrors at sharp turns in Menzah route for better visibility',
    'pending'
FROM drivers d
WHERE d.name LIKE 'Leila%' OR d.name LIKE 'Karim%';

-- Sample prayer breaks
INSERT INTO prayer_breaks (driver_id, prayer_time, scheduled_time, actual_time, status)
SELECT 
    d.id,
    'Dhuhr',
    CURRENT_TIMESTAMP + interval '2 hours',
    NULL,
    'scheduled'
FROM drivers d;

-- Additional prayer breaks
INSERT INTO prayer_breaks (driver_id, prayer_time, scheduled_time, actual_time, status)
SELECT 
    d.id,
    'Asr',
    CURRENT_TIMESTAMP + interval '4 hours',
    NULL,
    'scheduled'
FROM drivers d
WHERE d.name LIKE 'Youssef%' OR d.name LIKE 'Amira%' OR d.name LIKE 'Karim%';