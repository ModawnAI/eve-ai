-- EVE AI Initial Database Schema
-- Version: 1.0.0
-- Description: Creates all core tables for the insurance agency automation platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'agent', 'staff');
CREATE TYPE client_type AS ENUM ('individual', 'business');
CREATE TYPE policy_status AS ENUM ('quote', 'pending', 'active', 'cancelled', 'expired', 'non_renewed');
CREATE TYPE line_of_business AS ENUM ('personal_auto', 'homeowners', 'commercial', 'health', 'life', 'other');
CREATE TYPE document_type AS ENUM ('id_card', 'dec_page', 'application', 'endorsement', 'cancellation', 'invoice', 'claim', 'other');
CREATE TYPE ai_processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE language_preference AS ENUM ('en', 'zh-CN');
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE conversation_context AS ENUM ('general', 'client', 'policy', 'document');

-- =============================================
-- AGENCIES TABLE (Multi-tenant root)
-- =============================================

CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50) DEFAULT 'CA',
    zip_code VARCHAR(20),
    website VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS TABLE (Agency staff)
-- =============================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'staff',
    preferred_language language_preference DEFAULT 'en',
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- CLIENTS TABLE
-- =============================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    type client_type DEFAULT 'individual',

    -- Personal info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    business_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    date_of_birth DATE,
    ssn_encrypted TEXT, -- Encrypted using pgcrypto

    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50) DEFAULT 'CA',
    zip_code VARCHAR(20),

    -- Preferences
    preferred_language language_preference DEFAULT 'en',
    notes TEXT,
    tags TEXT[],

    -- Metadata
    external_id VARCHAR(100), -- Record Guardian ID
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_external_id ON clients(external_id);

-- =============================================
-- CARRIERS TABLE
-- =============================================

CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ivans_code VARCHAR(50),
    supported_lines line_of_business[] DEFAULT '{}',
    website VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_carriers_ivans ON carriers(ivans_code);

-- =============================================
-- POLICIES TABLE (Master policy record)
-- =============================================

CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES carriers(id),

    policy_number VARCHAR(100) NOT NULL,
    line_of_business line_of_business NOT NULL,
    status policy_status DEFAULT 'quote',

    effective_date DATE,
    expiration_date DATE,
    premium DECIMAL(12, 2),

    notes TEXT,
    external_id VARCHAR(100), -- Record Guardian policy ID

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policies_agency ON policies(agency_id);
CREATE INDEX idx_policies_client ON policies(client_id);
CREATE INDEX idx_policies_carrier ON policies(carrier_id);
CREATE INDEX idx_policies_number ON policies(policy_number);
CREATE INDEX idx_policies_expiration ON policies(expiration_date);
CREATE INDEX idx_policies_status ON policies(status);

-- =============================================
-- POLICY PERSONAL LINES (Auto/Home details)
-- =============================================

CREATE TABLE policy_personal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,

    -- Vehicle details (for auto)
    vehicles JSONB DEFAULT '[]', -- Array of { vin, year, make, model, mileage, usage, ownership }

    -- Driver details
    drivers JSONB DEFAULT '[]', -- Array of { name, dob, license_number, license_state, accidents, violations }

    -- Property details (for home)
    property_type VARCHAR(50), -- single_family, condo, townhouse, etc.
    year_built INTEGER,
    square_footage INTEGER,
    construction_type VARCHAR(50),
    roof_type VARCHAR(50),
    roof_year INTEGER,

    -- Home-specific risks
    dog_breed TEXT,
    pool_type VARCHAR(50),
    pool_fenced BOOLEAN,
    trampoline BOOLEAN DEFAULT false,

    -- Loss history
    loss_history JSONB DEFAULT '[]', -- Array of { date, type, amount, description }

    -- Coverage details
    coverage_details JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policy_personal_lines_policy ON policy_personal_lines(policy_id);

-- =============================================
-- POLICY COMMERCIAL LINES
-- =============================================

CREATE TABLE policy_commercial_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,

    -- Business details
    dba VARCHAR(255),
    fein_encrypted TEXT, -- Encrypted Federal EIN
    entity_type VARCHAR(50), -- LLC, Corp, Sole Prop, Partnership
    years_in_business INTEGER,
    num_employees INTEGER,
    annual_revenue DECIMAL(15, 2),
    total_assets DECIMAL(15, 2),

    -- Operations
    business_description TEXT,
    naics_code VARCHAR(20),
    sic_code VARCHAR(20),
    radius_of_operation VARCHAR(50), -- local, regional, national

    -- Fleet (if applicable)
    fleet_vehicles JSONB DEFAULT '[]', -- Array of vehicle details

    -- Safety and compliance
    safety_guidelines JSONB DEFAULT '{}',
    certificate_requirements JSONB DEFAULT '[]', -- Certificate holder requirements

    -- Subcontractors
    uses_subcontractors BOOLEAN DEFAULT false,
    subcontractors JSONB DEFAULT '[]',

    -- Loss runs
    loss_runs JSONB DEFAULT '[]',

    -- Coverage details
    coverage_details JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policy_commercial_lines_policy ON policy_commercial_lines(policy_id);

-- =============================================
-- POLICY HEALTH INSURANCE
-- =============================================

CREATE TABLE policy_health_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,

    -- Covered CA specifics
    covered_ca_case_number VARCHAR(100),
    enrollment_period VARCHAR(50), -- OE, SEP, etc.

    -- Household
    household_size INTEGER,
    household_members JSONB DEFAULT '[]', -- Array of { name, dob, relationship, ssn_encrypted, tobacco_use }

    -- Immigration status (for subsidy eligibility)
    immigration_documentation_status VARCHAR(100),

    -- Income
    magi_income DECIMAL(12, 2), -- Modified Adjusted Gross Income
    income_verification_type VARCHAR(50),
    income_last_verified DATE,
    income_change_flag BOOLEAN DEFAULT false,

    -- Subsidy tracking
    aptc_amount DECIMAL(10, 2), -- Advance Premium Tax Credit
    csr_level VARCHAR(20), -- Cost Sharing Reduction level

    -- Preferences
    preferred_providers JSONB DEFAULT '[]', -- Preferred doctors/hospitals
    current_prescriptions JSONB DEFAULT '[]', -- Current medications

    -- Plan details
    plan_name VARCHAR(255),
    plan_metal_tier VARCHAR(20), -- Bronze, Silver, Gold, Platinum
    monthly_premium DECIMAL(10, 2),
    net_premium DECIMAL(10, 2), -- After APTC

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policy_health_insurance_policy ON policy_health_insurance(policy_id);
CREATE INDEX idx_policy_health_covered_ca ON policy_health_insurance(covered_ca_case_number);

-- =============================================
-- DOCUMENTS TABLE
-- =============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,

    name VARCHAR(255) NOT NULL,
    type document_type DEFAULT 'other',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- AI processing
    ai_extracted_data JSONB,
    ai_processing_status ai_processing_status,
    ai_processed_at TIMESTAMPTZ,

    -- IVANS integration
    ivans_download_id VARCHAR(100),
    ivans_download_date TIMESTAMPTZ,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_agency ON documents(agency_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_policy ON documents(policy_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_ivans ON documents(ivans_download_id);

-- =============================================
-- AI CONVERSATIONS TABLE
-- =============================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255),
    context_type conversation_context DEFAULT 'general',
    context_id UUID, -- Reference to client, policy, or document

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_agency ON ai_conversations(agency_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- =============================================
-- AI MESSAGES TABLE
-- =============================================

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,

    role message_role NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_agency ON activity_log(agency_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carriers_updated_at BEFORE UPDATE ON carriers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_personal_lines_updated_at BEFORE UPDATE ON policy_personal_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_commercial_lines_updated_at BEFORE UPDATE ON policy_commercial_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_health_insurance_updated_at BEFORE UPDATE ON policy_health_insurance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
