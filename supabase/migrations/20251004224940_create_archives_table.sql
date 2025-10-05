/*
  # Create Monthly Archives Table

  ## Overview
  This migration creates a table to store monthly archives of income records.
  Teachers can archive their monthly data to keep their records organized.

  ## Tables Created
  
  ### 1. archives
  Stores archived monthly summaries
  - `id` (uuid, primary key) - Unique identifier for each archive
  - `user_id` (uuid, foreign key) - References auth.users, the teacher who created the archive
  - `month` (integer) - Month number (1-12)
  - `year` (integer) - Year of the archive
  - `total_students` (integer) - Total number of students for the month
  - `total_teacher_profit` (numeric) - Total teacher profit for the month
  - `total_school_profit` (numeric) - Total school profit for the month
  - `total_income` (numeric) - Total income for the month
  - `records_data` (jsonb) - JSON array containing all daily records for the month
  - `created_at` (timestamptz) - When the archive was created

  ## Security
  
  ### Row Level Security (RLS)
  - Enabled on archives table
  - Teachers can only view their own archives
  - Teachers can only insert archives for themselves
  - Teachers can delete their own archives

  ## Indexes
  - Index on user_id for faster queries
  - Composite index on (user_id, year, month) for unique constraint and fast lookups
*/

-- Create archives table
CREATE TABLE IF NOT EXISTS archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  total_students integer NOT NULL DEFAULT 0 CHECK (total_students >= 0),
  total_teacher_profit numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total_teacher_profit >= 0),
  total_school_profit numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total_school_profit >= 0),
  total_income numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total_income >= 0),
  records_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_archives_user_id ON archives(user_id);
CREATE INDEX IF NOT EXISTS idx_archives_user_year_month ON archives(user_id, year, month);

-- Enable Row Level Security
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for archives table

-- Policy: Teachers can view their own archives
CREATE POLICY "Teachers can view own archives"
  ON archives
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Teachers can insert their own archives
CREATE POLICY "Teachers can insert own archives"
  ON archives
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Teachers can delete their own archives
CREATE POLICY "Teachers can delete own archives"
  ON archives
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);