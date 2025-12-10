export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          name: string;
          license_number: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          website: string | null;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          license_number?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          website?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          license_number?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          website?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          agency_id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'agent' | 'staff';
          preferred_language: 'en' | 'zh-CN';
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          agency_id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'agent' | 'staff';
          preferred_language?: 'en' | 'zh-CN';
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'agent' | 'staff';
          preferred_language?: 'en' | 'zh-CN';
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_agency_id_fkey';
            columns: ['agency_id'];
            referencedRelation: 'agencies';
            referencedColumns: ['id'];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          agency_id: string;
          type: 'individual' | 'business';
          first_name: string | null;
          last_name: string | null;
          business_name: string | null;
          email: string | null;
          phone: string | null;
          secondary_phone: string | null;
          date_of_birth: string | null;
          ssn_encrypted: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          preferred_language: 'en' | 'zh-CN';
          notes: string | null;
          tags: string[] | null;
          external_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          type?: 'individual' | 'business';
          first_name?: string | null;
          last_name?: string | null;
          business_name?: string | null;
          email?: string | null;
          phone?: string | null;
          secondary_phone?: string | null;
          date_of_birth?: string | null;
          ssn_encrypted?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          preferred_language?: 'en' | 'zh-CN';
          notes?: string | null;
          tags?: string[] | null;
          external_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          type?: 'individual' | 'business';
          first_name?: string | null;
          last_name?: string | null;
          business_name?: string | null;
          email?: string | null;
          phone?: string | null;
          secondary_phone?: string | null;
          date_of_birth?: string | null;
          ssn_encrypted?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          preferred_language?: 'en' | 'zh-CN';
          notes?: string | null;
          tags?: string[] | null;
          external_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_agency_id_fkey';
            columns: ['agency_id'];
            referencedRelation: 'agencies';
            referencedColumns: ['id'];
          }
        ];
      };
      carriers: {
        Row: {
          id: string;
          name: string;
          ivans_code: string | null;
          supported_lines: string[];
          website: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          ivans_code?: string | null;
          supported_lines?: string[];
          website?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          ivans_code?: string | null;
          supported_lines?: string[];
          website?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      policies: {
        Row: {
          id: string;
          agency_id: string;
          client_id: string;
          carrier_id: string | null;
          policy_number: string;
          line_of_business: 'personal_auto' | 'homeowners' | 'commercial' | 'health' | 'life' | 'other';
          status: 'quote' | 'pending' | 'active' | 'cancelled' | 'expired' | 'non_renewed';
          effective_date: string | null;
          expiration_date: string | null;
          premium: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          client_id: string;
          carrier_id?: string | null;
          policy_number: string;
          line_of_business: 'personal_auto' | 'homeowners' | 'commercial' | 'health' | 'life' | 'other';
          status?: 'quote' | 'pending' | 'active' | 'cancelled' | 'expired' | 'non_renewed';
          effective_date?: string | null;
          expiration_date?: string | null;
          premium?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          client_id?: string;
          carrier_id?: string | null;
          policy_number?: string;
          line_of_business?: 'personal_auto' | 'homeowners' | 'commercial' | 'health' | 'life' | 'other';
          status?: 'quote' | 'pending' | 'active' | 'cancelled' | 'expired' | 'non_renewed';
          effective_date?: string | null;
          expiration_date?: string | null;
          premium?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'policies_agency_id_fkey';
            columns: ['agency_id'];
            referencedRelation: 'agencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'policies_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'policies_carrier_id_fkey';
            columns: ['carrier_id'];
            referencedRelation: 'carriers';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          agency_id: string;
          client_id: string | null;
          policy_id: string | null;
          name: string;
          type: 'id_card' | 'dec_page' | 'application' | 'endorsement' | 'cancellation' | 'invoice' | 'claim' | 'other';
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          ai_extracted_data: Json | null;
          ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
          ai_processed_at: string | null;
          ivans_download_id: string | null;
          ivans_download_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          client_id?: string | null;
          policy_id?: string | null;
          name: string;
          type?: 'id_card' | 'dec_page' | 'application' | 'endorsement' | 'cancellation' | 'invoice' | 'claim' | 'other';
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          ai_extracted_data?: Json | null;
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          ai_processed_at?: string | null;
          ivans_download_id?: string | null;
          ivans_download_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          client_id?: string | null;
          policy_id?: string | null;
          name?: string;
          type?: 'id_card' | 'dec_page' | 'application' | 'endorsement' | 'cancellation' | 'invoice' | 'claim' | 'other';
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          ai_extracted_data?: Json | null;
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          ai_processed_at?: string | null;
          ivans_download_id?: string | null;
          ivans_download_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_agency_id_fkey';
            columns: ['agency_id'];
            referencedRelation: 'agencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_policy_id_fkey';
            columns: ['policy_id'];
            referencedRelation: 'policies';
            referencedColumns: ['id'];
          }
        ];
      };
      activity_log: {
        Row: {
          id: string;
          agency_id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_agency_id_fkey';
            columns: ['agency_id'];
            referencedRelation: 'agencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_log_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      ai_conversations: {
        Row: {
          id: string;
          agency_id: string;
          user_id: string;
          title: string | null;
          context_type: 'general' | 'client' | 'policy' | 'document';
          context_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          user_id: string;
          title?: string | null;
          context_type?: 'general' | 'client' | 'policy' | 'document';
          context_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          user_id?: string;
          title?: string | null;
          context_type?: 'general' | 'client' | 'policy' | 'document';
          context_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_agency_id_fkey';
            columns: ['agency_id'];
            referencedRelation: 'agencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_conversations_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          tokens_used?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_messages_conversation_id_fkey';
            columns: ['conversation_id'];
            referencedRelation: 'ai_conversations';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'agent' | 'staff';
      client_type: 'individual' | 'business';
      policy_status: 'quote' | 'pending' | 'active' | 'cancelled' | 'expired' | 'non_renewed';
      line_of_business: 'personal_auto' | 'homeowners' | 'commercial' | 'health' | 'life' | 'other';
      document_type: 'id_card' | 'dec_page' | 'application' | 'endorsement' | 'cancellation' | 'invoice' | 'claim' | 'other';
      language: 'en' | 'zh-CN';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
