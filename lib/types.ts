export type ToolWithQuestions = {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    isPro: boolean;
    isActive: boolean;
    category: string;
}
export type ToolWithoutQuestions = {
    _id: string;
    title: string;
    description: string;
    isPro: boolean;
    isActive: boolean;
}

export type Question = {
    _id: string;
    question: string;
    answer: string;
}

// MongoDB lean query result types (for .lean() queries)
export interface CategoryLean {
  _id: string; // MongoDB ObjectId
  name: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserLean {
  _id: string; // MongoDB ObjectId
  name: string;
  email: string;
  isAdmin: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ToolLean {
  _id: string; // MongoDB ObjectId
  title: string;
  description: string;
  systemInstructions: string;
  isPro: boolean;
  isActive: boolean;
  category?: {
    _id: string; // MongoDB ObjectId
    name: string;
  } | null;
  questions?: {
    _id?: string; // MongoDB ObjectId
    question: string;
    answer?: string;
    maxAnsLength?: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionLean {
  _id?: string; // MongoDB ObjectId
  question: string;
  answer?: string;
  maxAnsLength?: number;
}

// Filter type for MongoDB queries
export interface ToolFilter {
  category?: string;
  userId?: string;
  $or?: Array<{
    title?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    userId?: string | { $exists: boolean };
    isActive?: boolean;
  }>;
}

export interface Tool {
    id: string;
    title: string;
    description: string;
    systemInstructions: string;
    isPro: boolean;
    isActive: boolean;
    category?: {
      id: string;
      name: string;
    } | null;
    questionsCount: number;
    createdAt?: string;
    updatedAt?: string;
  }
  