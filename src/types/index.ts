export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  genre: string;
  target_words: number;
  current_words: number;
  status: 'draft' | 'writing' | 'completed' | 'published';
  user_id: string;
  world_setting?: WorldSetting;
  created_at: string;
  updated_at: string;
}

export interface WorldSetting {
  id: string;
  project_id: string;
  name: string;
  description: string;
  era: string;
  technology_level: string;
  magic_system?: string;
  geography: string;
  politics: string;
  economy: string;
  culture: string;
  history: string;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  gender?: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  skills: string[];
  relationships: CharacterRelationship[];
  development_arc: string;
  current_status: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterRelationship {
  character_id: string;
  related_character_id: string;
  relationship_type: 'family' | 'friend' | 'enemy' | 'lover' | 'mentor' | 'student' | 'colleague' | 'other';
  description: string;
  intensity: number; // 1-10
}

export interface PlotOutline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  structure: 'three_act' | 'heros_journey' | 'kishotenketsu' | 'custom';
  acts: PlotAct[];
  themes: string[];
  conflicts: PlotConflict[];
  created_at: string;
  updated_at: string;
}

export interface PlotAct {
  id: string;
  outline_id: string;
  act_number: number;
  title: string;
  description: string;
  word_target: number;
  scenes: PlotScene[];
}

export interface PlotScene {
  id: string;
  act_id: string;
  scene_number: number;
  title: string;
  description: string;
  purpose: string;
  characters: string[]; // character IDs
  location: string;
  time: string;
  mood: string;
  conflicts: string[];
  outcomes: string[];
}

export interface PlotConflict {
  id: string;
  type: 'man_vs_man' | 'man_vs_self' | 'man_vs_society' | 'man_vs_nature' | 'man_vs_technology' | 'man_vs_supernatural';
  description: string;
  characters_involved: string[];
  resolution_strategy: string;
}

export interface Chapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  summary: string;
  content: string;
  word_count: number;
  status: 'planned' | 'outlined' | 'drafted' | 'revised' | 'completed';
  scene_id?: string;
  generation_settings?: GenerationSettings;
  created_at: string;
  updated_at: string;
}

export interface GenerationSettings {
  style: string;
  tone: string;
  perspective: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient';
  tense: 'past' | 'present' | 'future';
  target_words: number;
  include_dialogue: boolean;
  description_level: 'minimal' | 'moderate' | 'detailed';
  pacing: 'fast' | 'medium' | 'slow';
  focus_elements: string[];
}

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  sample_text: string;
  characteristics: {
    vocabulary_level: 'simple' | 'moderate' | 'complex';
    sentence_structure: 'simple' | 'varied' | 'complex';
    descriptive_style: 'minimal' | 'balanced' | 'rich';
    dialogue_style: 'formal' | 'casual' | 'period_appropriate';
    narrative_voice: 'detached' | 'intimate' | 'omniscient';
  };
  genre_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GenerationTask {
  id: string;
  type: 'chapter' | 'scene' | 'character_description' | 'dialogue' | 'revision';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_data: any;
  output_data?: any;
  error_message?: string;
  progress: number; // 0-100
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentReview {
  id: string;
  content_id: string;
  content_type: 'chapter' | 'character' | 'plot';
  review_type: 'consistency' | 'quality' | 'plot_holes' | 'character_development';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  issues: ReviewIssue[];
  suggestions: string[];
  reviewer: 'ai' | 'user';
  created_at: string;
  updated_at: string;
}

export interface ReviewIssue {
  type: 'plot_hole' | 'character_inconsistency' | 'timeline_error' | 'style_inconsistency' | 'grammar' | 'logic_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  suggestion: string;
}

export interface KnowledgeBase {
  id: string;
  project_id: string;
  name: string;
  type: 'reference_book' | 'character_notes' | 'world_building' | 'research' | 'style_guide';
  content: string;
  tags: string[];
  searchable: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form types
export interface CreateProjectForm {
  title: string;
  description?: string;
  genre: string;
  target_words: number;
}

export interface CreateCharacterForm {
  name: string;
  role: Character['role'];
  age?: number;
  gender?: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  skills: string[];
}

export interface CreateChapterForm {
  title: string;
  summary: string;
  target_words: number;
  generation_settings: GenerationSettings;
}

// Store types
export interface AppState {
  user: User | null;
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export interface ProjectState {
  characters: Character[];
  chapters: Chapter[];
  plotOutline: PlotOutline | null;
  worldSetting: WorldSetting | null;
  knowledgeBase: KnowledgeBase[];
  generationTasks: GenerationTask[];
  contentReviews: ContentReview[];
}