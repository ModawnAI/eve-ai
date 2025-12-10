-- EVE AI Row Level Security Policies
-- Version: 1.0.0
-- Description: Implements RLS for multi-tenant data isolation

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_personal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_commercial_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_health_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Get current user's agency_id
-- =============================================

CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT agency_id
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Check if user is admin
-- =============================================

CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AGENCIES POLICIES
-- =============================================

-- Users can only see their own agency
CREATE POLICY agencies_select ON agencies
    FOR SELECT
    USING (id = get_user_agency_id());

-- Only admins can update agency settings
CREATE POLICY agencies_update ON agencies
    FOR UPDATE
    USING (id = get_user_agency_id() AND is_user_admin())
    WITH CHECK (id = get_user_agency_id() AND is_user_admin());

-- =============================================
-- USERS POLICIES
-- =============================================

-- Users can see all users in their agency
CREATE POLICY users_select ON users
    FOR SELECT
    USING (agency_id = get_user_agency_id());

-- Users can update their own profile
CREATE POLICY users_update_self ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can update any user in their agency
CREATE POLICY users_update_admin ON users
    FOR UPDATE
    USING (agency_id = get_user_agency_id() AND is_user_admin())
    WITH CHECK (agency_id = get_user_agency_id() AND is_user_admin());

-- Admins can insert new users
CREATE POLICY users_insert ON users
    FOR INSERT
    WITH CHECK (agency_id = get_user_agency_id() AND is_user_admin());

-- Admins can delete users (except themselves)
CREATE POLICY users_delete ON users
    FOR DELETE
    USING (agency_id = get_user_agency_id() AND is_user_admin() AND id != auth.uid());

-- =============================================
-- CLIENTS POLICIES
-- =============================================

-- Users can see all clients in their agency
CREATE POLICY clients_select ON clients
    FOR SELECT
    USING (agency_id = get_user_agency_id());

-- Users can insert clients into their agency
CREATE POLICY clients_insert ON clients
    FOR INSERT
    WITH CHECK (agency_id = get_user_agency_id());

-- Users can update clients in their agency
CREATE POLICY clients_update ON clients
    FOR UPDATE
    USING (agency_id = get_user_agency_id())
    WITH CHECK (agency_id = get_user_agency_id());

-- Only admins can delete clients
CREATE POLICY clients_delete ON clients
    FOR DELETE
    USING (agency_id = get_user_agency_id() AND is_user_admin());

-- =============================================
-- CARRIERS POLICIES (Global read, admin write)
-- =============================================

-- Everyone can read carriers
CREATE POLICY carriers_select ON carriers
    FOR SELECT
    USING (true);

-- Only admins can modify carriers
CREATE POLICY carriers_insert ON carriers
    FOR INSERT
    WITH CHECK (is_user_admin());

CREATE POLICY carriers_update ON carriers
    FOR UPDATE
    USING (is_user_admin())
    WITH CHECK (is_user_admin());

CREATE POLICY carriers_delete ON carriers
    FOR DELETE
    USING (is_user_admin());

-- =============================================
-- POLICIES POLICIES
-- =============================================

-- Users can see all policies in their agency
CREATE POLICY policies_select ON policies
    FOR SELECT
    USING (agency_id = get_user_agency_id());

-- Users can insert policies into their agency
CREATE POLICY policies_insert ON policies
    FOR INSERT
    WITH CHECK (agency_id = get_user_agency_id());

-- Users can update policies in their agency
CREATE POLICY policies_update ON policies
    FOR UPDATE
    USING (agency_id = get_user_agency_id())
    WITH CHECK (agency_id = get_user_agency_id());

-- Only admins can delete policies
CREATE POLICY policies_delete ON policies
    FOR DELETE
    USING (agency_id = get_user_agency_id() AND is_user_admin());

-- =============================================
-- POLICY DETAIL TABLES POLICIES
-- (Personal, Commercial, Health)
-- =============================================

-- Policy Personal Lines
CREATE POLICY policy_personal_lines_select ON policy_personal_lines
    FOR SELECT
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_personal_lines_insert ON policy_personal_lines
    FOR INSERT
    WITH CHECK (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_personal_lines_update ON policy_personal_lines
    FOR UPDATE
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_personal_lines_delete ON policy_personal_lines
    FOR DELETE
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id()) AND is_user_admin()
    );

-- Policy Commercial Lines
CREATE POLICY policy_commercial_lines_select ON policy_commercial_lines
    FOR SELECT
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_commercial_lines_insert ON policy_commercial_lines
    FOR INSERT
    WITH CHECK (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_commercial_lines_update ON policy_commercial_lines
    FOR UPDATE
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_commercial_lines_delete ON policy_commercial_lines
    FOR DELETE
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id()) AND is_user_admin()
    );

-- Policy Health Insurance
CREATE POLICY policy_health_insurance_select ON policy_health_insurance
    FOR SELECT
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_health_insurance_insert ON policy_health_insurance
    FOR INSERT
    WITH CHECK (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_health_insurance_update ON policy_health_insurance
    FOR UPDATE
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id())
    );

CREATE POLICY policy_health_insurance_delete ON policy_health_insurance
    FOR DELETE
    USING (
        policy_id IN (SELECT id FROM policies WHERE agency_id = get_user_agency_id()) AND is_user_admin()
    );

-- =============================================
-- DOCUMENTS POLICIES
-- =============================================

CREATE POLICY documents_select ON documents
    FOR SELECT
    USING (agency_id = get_user_agency_id());

CREATE POLICY documents_insert ON documents
    FOR INSERT
    WITH CHECK (agency_id = get_user_agency_id());

CREATE POLICY documents_update ON documents
    FOR UPDATE
    USING (agency_id = get_user_agency_id())
    WITH CHECK (agency_id = get_user_agency_id());

CREATE POLICY documents_delete ON documents
    FOR DELETE
    USING (agency_id = get_user_agency_id() AND is_user_admin());

-- =============================================
-- AI CONVERSATIONS POLICIES
-- =============================================

-- Users can see their own conversations
CREATE POLICY ai_conversations_select ON ai_conversations
    FOR SELECT
    USING (user_id = auth.uid() OR agency_id = get_user_agency_id());

CREATE POLICY ai_conversations_insert ON ai_conversations
    FOR INSERT
    WITH CHECK (user_id = auth.uid() AND agency_id = get_user_agency_id());

CREATE POLICY ai_conversations_update ON ai_conversations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_conversations_delete ON ai_conversations
    FOR DELETE
    USING (user_id = auth.uid());

-- =============================================
-- AI MESSAGES POLICIES
-- =============================================

CREATE POLICY ai_messages_select ON ai_messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM ai_conversations
            WHERE user_id = auth.uid() OR agency_id = get_user_agency_id()
        )
    );

CREATE POLICY ai_messages_insert ON ai_messages
    FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM ai_conversations WHERE user_id = auth.uid()
        )
    );

-- Messages are immutable - no update or delete policies

-- =============================================
-- ACTIVITY LOG POLICIES
-- =============================================

-- Users can see activity in their agency
CREATE POLICY activity_log_select ON activity_log
    FOR SELECT
    USING (agency_id = get_user_agency_id());

-- System inserts activity (using service role)
CREATE POLICY activity_log_insert ON activity_log
    FOR INSERT
    WITH CHECK (agency_id = get_user_agency_id());

-- Activity logs are immutable - no update or delete

-- =============================================
-- STORAGE POLICIES (for document uploads)
-- =============================================

-- Note: These need to be created via Supabase Dashboard or CLI
-- Storage bucket: 'documents'

-- Policy: Users can upload documents to their agency folder
-- Path pattern: {agency_id}/{client_id?}/{document_id}

-- Policy: Users can download documents from their agency folder
