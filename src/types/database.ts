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

  // Add these types to your existing database.ts file

// Remedy-specific table types
export type RemedyCategory = {
  id: string
  name: string
  icon: string
  description: string | null
  color: string
  created_at: string | null
}

export type Remedy = {
  id: string
  title: string
  subtitle: string | null
  description: string
  summary: string | null
  author_id: string | null
  location_id: string | null
  category_id: string | null
  region: string | null
  origin_story: string | null
  preparation_time: number | null
  cooking_time: number | null
  servings: number | null
  difficulty: 'Mudah' | 'Sedang' | 'Sulit' | null
  trust_level: number | null
  verification_count: number | null
  view_count: number | null
  coordinates: unknown | null // PostGIS geography type
  status: 'draft' | 'published' | 'under_review' | 'archived' | null
  safety_warnings: string[] | null
  contraindications: string[] | null
  featured: boolean | null
  metadata: Json | null
  created_at: string | null
  updated_at: string | null
}

export type RemedyIngredient = {
  id: string
  remedy_id: string | null
  name: string
  amount: string | null
  unit: string | null
  notes: string | null
  is_main_ingredient: boolean | null
  order_index: number | null
  created_at: string | null
}

export type RemedyStep = {
  id: string
  remedy_id: string | null
  step_number: number
  title: string
  description: string
  image_url: string | null
  tips: string | null
  estimated_time: number | null
  temperature: string | null
  created_at: string | null
}

export type RemedyBenefit = {
  id: string
  remedy_id: string | null
  benefit: string
  description: string | null
  scientific_backing: string | null
  category: string | null
  order_index: number | null
  created_at: string | null
}

export type RemedyImage = {
  id: string
  remedy_id: string | null
  image_url: string
  caption: string | null
  is_primary: boolean | null
  image_type: 'general' | 'ingredient' | 'step' | 'final_result' | 'process' | null
  step_id: string | null
  alt_text: string | null
  order_index: number | null
  created_at: string | null
}

export type RemedyTestimonial = {
  user: any
  id: string
  remedy_id: string | null
  user_id: string | null
  name: string | null
  location: string | null
  testimonial: string
  rating: number | null
  usage_duration: string | null
  health_condition: string | null
  results_experienced: string | null
  would_recommend: boolean | null
  is_verified: boolean | null
  is_featured: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type RemedyVerification = {
  id: string
  remedy_id: string | null
  user_id: string | null
  verification_type: 'family_tradition' | 'local_knowledge' | 'tried_personally' | 
                    'cultural_authenticity' | 'ingredient_accuracy' | 'safety_concern' | 
                    'medical_validation'
  evidence_text: string | null
  evidence_url: string | null
  confidence_level: number | null
  is_positive: boolean | null
  expertise_area: string | null
  years_of_experience: number | null
  location_context: string | null
  additional_notes: string | null
  is_verified: boolean | null
  created_at: string | null
}

// Extended types with relations
export type RemedyWithDetails = Remedy & {
  category?: RemedyCategory
  location?: Location
  author?: Profile
  ingredients?: RemedyIngredient[]
  steps?: RemedyStep[]
  benefits?: RemedyBenefit[]
  images?: RemedyImage[]
  testimonials?: RemedyTestimonial[]
  verifications?: RemedyVerification[]
  primary_image?: string
  main_ingredients?: RemedyIngredient[]
  avg_rating?: number
  testimonial_count?: number
  verification_summary?: {
    family_tradition_count: number
    local_knowledge_count: number
    tried_personally_count: number
    total_count: number
  }
}

export type RemedyCategoryWithCount = RemedyCategory & {
  remedy_count?: number
}

export type RemedySearchResult = {
  id: string
  title: string
  subtitle: string | null
  region: string | null
  difficulty: string | null
  trust_level: number | null
  category_name: string | null
  primary_image: string | null
  rank: number
}

// Remedy difficulty levels
export type RemedyDifficulty = 'Mudah' | 'Sedang' | 'Sulit'

// Remedy verification types
export type RemedyVerificationType = 
  | 'family_tradition'
  | 'local_knowledge' 
  | 'tried_personally'
  | 'cultural_authenticity'
  | 'ingredient_accuracy'
  | 'safety_concern'
  | 'medical_validation'

// Remedy image types
export type RemedyImageType = 
  | 'general'
  | 'ingredient'
  | 'step'
  | 'final_result'
  | 'process'

// Remedy status
export type RemedyStatus = 'draft' | 'published' | 'under_review' | 'archived'

// Insert types
export type RemedyInsert = Omit<Remedy, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'verification_count' | 'trust_level'>
export type RemedyIngredientInsert = Omit<RemedyIngredient, 'id' | 'created_at'>
export type RemedyStepInsert = Omit<RemedyStep, 'id' | 'created_at'>
export type RemedyBenefitInsert = Omit<RemedyBenefit, 'id' | 'created_at'>
export type RemedyImageInsert = Omit<RemedyImage, 'id' | 'created_at'>
export type RemedyTestimonialInsert = Omit<RemedyTestimonial, 'id' | 'created_at' | 'updated_at'>
export type RemedyVerificationInsert = Omit<RemedyVerification, 'id' | 'created_at' | 'is_verified'>

// Update types
export type RemedyUpdate = Partial<RemedyInsert>
export type RemedyTestimonialUpdate = Partial<RemedyTestimonialInsert>

// Filter types for frontend
export type RemedyFilters = {
  category_id?: string
  region?: string
  difficulty?: RemedyDifficulty
  trust_level_min?: number
  featured?: boolean
  search?: string
}

// Sort options
export type RemedySortOption = 
  | 'newest'
  | 'oldest'
  | 'trust_level'
  | 'verification_count'
  | 'popularity'
  | 'alphabetical'

// API response types
export type RemedyListResponse = {
  remedies: RemedyWithDetails[]
  total_count: number
  page: number
  per_page: number
  has_next_page: boolean
}

export type RemedyDetailResponse = RemedyWithDetails

// Form data types for creating/editing remedies
export type CreateRemedyFormData = {
  title: string
  subtitle?: string
  description: string
  summary?: string
  category_id: string
  location_id?: string
  region?: string
  origin_story?: string
  preparation_time?: number
  cooking_time?: number
  servings?: number
  difficulty: RemedyDifficulty
  safety_warnings?: string[]
  contraindications?: string[]
  ingredients: RemedyIngredientInsert[]
  steps: RemedyStepInsert[]
  benefits: RemedyBenefitInsert[]
  images?: RemedyImageInsert[]
}

// Utility functions type
export interface RemedyUtils {
  getTrustLevelColor: (level: number) => string
  getTrustLevelLabel: (level: number) => string
  getDifficultyColor: (difficulty: RemedyDifficulty) => string
  formatPreparationTime: (minutes: number) => string
  getVerificationTypeLabel: (type: RemedyVerificationType) => string
  calculateAverageRating: (testimonials: RemedyTestimonial[]) => number
}