/*
  # Teacher Income Tracking Schema

  ## Overview
  This migration creates the database schema for a teacher income tracking application.
  Teachers can record daily student attendance and automatically calculate profits.

  ## Tables Created
  
  ### 1. records
  Stores daily income records for teachers
  - `id` (uuid, primary key) - Unique identifier for each record
  - `user_id` (uuid, foreign key) - References auth.users, the teacher who created the record
  - `date` (date) - The date of the record
  - `students_count` (integer) - Number of students on that day
  - `price_per_student` (numeric) - Price charged per student (default 15)
  - `teacher_profit` (numeric) - Calculated profit for teacher (students_count * 12.5)
  - `school_profit` (numeric) - Calculated profit for school (students_count * 2.5)
  - `total` (numeric) - Total income (students_count * price_per_student)
  - `created_at` (timestamptz) - When the record was created

  ## Security
  
  ### Row Level Security (RLS)
  - Enabled on records table
  - Teachers can only view their own records
  - Teachers can only insert records for themselves
  - Teachers can update their own records
  - Teachers can delete their own records

  ## Indexes
  - Index on user_id for faster queries
  - Index on date for date-based filtering
  - Composite index on (user_id, date) for monthly summaries
*/

-- Create records table
CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  students_count integer NOT NULL CHECK (students_count >= 0),
  price_per_student numeric(10, 2) NOT NULL DEFAULT 15.00 CHECK (price_per_student >= 0),
  teacher_profit numeric(10, 2) NOT NULL CHECK (teacher_profit >= 0),
  school_profit numeric(10, 2) NOT NULL CHECK (school_profit >= 0),
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
CREATE INDEX IF NOT EXISTS idx_records_user_date ON records(user_id, date);

-- Enable Row Level Security
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for records table

-- Policy: Teachers can view their own records
CREATE POLICY "Teachers can view own records"
  ON records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Teachers can insert their own records
CREATE POLICY "Teachers can insert own records"
  ON records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Teachers can update their own records
CREATE POLICY "Teachers can update own records"
  ON records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Teachers can delete their own records
CREATE POLICY "Teachers can delete own records"
  ON records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);