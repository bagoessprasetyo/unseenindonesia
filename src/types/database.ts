export interface Database {
    public: {
      Tables: {
        categories: {
          Row: {
            id: string
            name: string
            icon: string
            description: string | null
            created_at: string | null
          }
          Insert: {
            id?: string
            name: string
            icon: string
            description?: string | null
            created_at?: string | null
          }
          Update: {
            id?: string
            name?: string
            icon?: string
            description?: string | null
            created_at?: string | null
          }
        }
        locations: {
          Row: {
            id: string
            name: string
            type: string
            coordinates: unknown // PostGIS geography type
            boundaries: unknown | null // PostGIS geography type
            parent_id: string | null
            created_at: string | null
          }
          Insert: {
            id?: string
            name: string
            type: string
            coordinates: unknown
            boundaries?: unknown | null
            parent_id?: string | null
            created_at?: string | null
          }
          Update: {
            id?: string
            name?: string
            type?: string
            coordinates?: unknown
            boundaries?: unknown | null
            parent_id?: string | null
            created_at?: string | null
          }
        }
        stories: {
          Row: {
            id: string
            title: string
            content: string
            summary: string | null
            author_id: string | null
            location_id: string | null
            category_id: string | null
            time_period: string | null
            historical_figures: string[] | null
            trust_level: number | null
            verification_count: number | null
            view_count: number | null
            coordinates: unknown | null // PostGIS geography type
            status: string | null
            metadata: Json | null
            created_at: string | null
            updated_at: string | null
          }
          Insert: {
            id?: string
            title: string
            content: string
            summary?: string | null
            author_id?: string | null
            location_id?: string | null
            category_id?: string | null
            time_period?: string | null
            historical_figures?: string[] | null
            trust_level?: number | null
            verification_count?: number | null
            view_count?: number | null
            coordinates?: unknown | null
            status?: string | null
            metadata?: Json | null
            created_at?: string | null
            updated_at?: string | null
          }
          Update: {
            id?: string
            title?: string
            content?: string
            summary?: string | null
            author_id?: string | null
            location_id?: string | null
            category_id?: string | null
            time_period?: string | null
            historical_figures?: string[] | null
            trust_level?: number | null
            verification_count?: number | null
            view_count?: number | null
            coordinates?: unknown | null
            status?: string | null
            metadata?: Json | null
            created_at?: string | null
            updated_at?: string | null
          }
        }
        story_images: {
          Row: {
            id: string
            story_id: string | null
            image_url: string
            caption: string | null
            is_primary: boolean | null
            created_at: string | null
          }
          Insert: {
            id?: string
            story_id?: string | null
            image_url: string
            caption?: string | null
            is_primary?: boolean | null
            created_at?: string | null
          }
          Update: {
            id?: string
            story_id?: string | null
            image_url?: string
            caption?: string | null
            is_primary?: boolean | null
            created_at?: string | null
          }
        }
        story_sources: {
          Row: {
            id: string
            story_id: string | null
            source_type: string
            source_title: string | null
            source_author: string | null
            source_url: string | null
            source_description: string | null
            created_at: string | null
          }
          Insert: {
            id?: string
            story_id?: string | null
            source_type: string
            source_title?: string | null
            source_author?: string | null
            source_url?: string | null
            source_description?: string | null
            created_at?: string | null
          }
          Update: {
            id?: string
            story_id?: string | null
            source_type?: string
            source_title?: string | null
            source_author?: string | null
            source_url?: string | null
            source_description?: string | null
            created_at?: string | null
          }
        }
        verifications: {
          Row: {
            id: string
            story_id: string | null
            user_id: string | null
            verification_type: string
            evidence_text: string | null
            evidence_url: string | null
            is_verified: boolean | null
            created_at: string | null
          }
          Insert: {
            id?: string
            story_id?: string | null
            user_id?: string | null
            verification_type: string
            evidence_text?: string | null
            evidence_url?: string | null
            is_verified?: boolean | null
            created_at?: string | null
          }
          Update: {
            id?: string
            story_id?: string | null
            user_id?: string | null
            verification_type?: string
            evidence_text?: string | null
            evidence_url?: string | null
            is_verified?: boolean | null
            created_at?: string | null
          }
        }
        profiles: {
          Row: {
            id: string
            username: string | null
            full_name: string | null
            avatar_url: string | null
            bio: string | null
            location: string | null
            contribution_count: number | null
            verification_count: number | null
            trust_score: number | null
            created_at: string | null
            updated_at: string | null
          }
          Insert: {
            id: string
            username?: string | null
            full_name?: string | null
            avatar_url?: string | null
            bio?: string | null
            location?: string | null
            contribution_count?: number | null
            verification_count?: number | null
            trust_score?: number | null
            created_at?: string | null
            updated_at?: string | null
          }
          Update: {
            id?: string
            username?: string | null
            full_name?: string | null
            avatar_url?: string | null
            bio?: string | null
            location?: string | null
            contribution_count?: number | null
            verification_count?: number | null
            trust_score?: number | null
            created_at?: string | null
            updated_at?: string | null
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        [_ in never]: never
      }
      Enums: {
        [_ in never]: never
      }
      CompositeTypes: {
        [_ in never]: never
      }
    }
  }
  
  // Helper types for easier usage
  export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
  
  export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
  export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
  export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
  
  // Specific table types
  export type Category = Tables<'categories'>
  export type Location = Tables<'locations'>
  export type Story = Tables<'stories'>
  export type StoryImage = Tables<'story_images'>
  export type StorySource = Tables<'story_sources'>
  export type Verification = Tables<'verifications'>
  export type Profile = Tables<'profiles'>
  
  // Extended types with relations
  export type StoryWithDetails = Story & {
    category?: Category
    location?: Location
    author?: Profile
    images?: StoryImage[]
    sources?: StorySource[]
    verifications?: Verification[]
    verification_summary?: {
      local_count: number
      source_count: number
      family_count: number
      evidence_count: number
      total_count: number
    }
  }
  
  export type LocationWithStories = Location & {
    stories?: Story[]
    story_count?: number
    parent?: Location
    children?: Location[]
  }
  
  export type ProfileWithStats = Profile & {
    stories?: Story[]
    recent_verifications?: Verification[]
  }
  
  // Verification types enum
  export type VerificationType = 
    | 'local_confirmation'
    | 'source_verification'
    | 'family_tradition'
    | 'visual_evidence'
    | 'need_more_info'
  
  // Trust levels enum
  export type TrustLevel = 0 | 1 | 2 | 3 | 4 // New, Interest, Verified, Source-backed, Highly Trusted
  
  // Story status enum
  export type StoryStatus = 'draft' | 'published' | 'under_review' | 'archived'
  
  // Source types enum
  export type SourceType = 
    | 'book'
    | 'academic_paper'
    | 'oral_tradition'
    | 'museum_collection'
    | 'government_document'
    | 'newspaper'
    | 'website'
    | 'personal_account'
  
  // Location types enum
  export type LocationType = 
    | 'country'
    | 'province'
    | 'regency'
    | 'city'
    | 'district'
    | 'village'
    | 'landmark'
  
  // Geographic coordinates type
  export interface Coordinates {
    lat: number
    lng: number
  }
  
  // Map bounds type
  export interface MapBounds {
    north: number
    south: number
    east: number
    west: number
  }
  
  // Story metadata type
  export interface StoryMetadata {
    reading_time?: number
    featured?: boolean
    editor_notes?: string
    tags?: string[]
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
    content_warnings?: string[]
  }