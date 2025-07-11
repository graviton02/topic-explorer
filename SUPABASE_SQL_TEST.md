# Supabase SQL Tests for RLS Policies

You can run these SQL queries in the Supabase SQL Editor to test your RLS policies directly.

## Step 1: Open SQL Editor in Supabase Dashboard

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query" to create a new SQL query

## Step 2: Test Policies with SQL

### Test 1: Check if RLS is enabled for both tables

```sql
SELECT
  table_schema,
  table_name,
  row_security
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name IN ('topics', 'graph');
```

This should show `true` in the `row_security` column for both tables.

### Test 2: Check existing RLS policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename IN ('topics', 'graph');
```

This will show all policies configured for your tables.

### Test 3: Try inserting data directly

```sql
-- Test inserting into topics table
INSERT INTO public.topics (
  session_id,
  name,
  description,
  subtopics,
  questions,
  timestamp
)
VALUES (
  'test-sql-' || extract(epoch from now()),
  'SQL Test Topic',
  'This is a test topic inserted via SQL',
  ARRAY['Subtopic 1', 'Subtopic 2', 'Subtopic 3'],
  ARRAY['Question 1?', 'Question 2?', 'Question 3?'],
  now()
)
RETURNING *;

-- Test inserting into graph table
INSERT INTO public.graph (
  session_id,
  nodes,
  edges
)
VALUES (
  'test-sql-' || extract(epoch from now()),
  '[{"id": "node1", "label": "Test Node"}]',
  '[]'
)
RETURNING *;
```

If these insert statements work in the SQL Editor but not in your application, it could indicate:

1. The RLS policies aren't correctly set up for anonymous users
2. The SQL Editor bypasses RLS (when run as the database owner/superuser)

## Step 3: Debugging Common Issues

If you're still having trouble, check:

1. **Verify that Enable Row Level Security is ON** for both tables
2. **Check policy definitions** - a policy with `USING (true)` and/or `WITH CHECK (true)` should allow all operations
3. **Look for conflicting policies** - multiple restrictive policies can block operations
4. **Verify column formats match** - especially for arrays and JSON data
5. **Try adding explicit policies for all operations** - INSERT, SELECT, UPDATE, and DELETE

## Step 4: Create Comprehensive Policies

Here's SQL to create policies that allow all operations for anonymous users:

```sql
-- For topics table
CREATE POLICY "Allow all operations for anonymous" ON public.topics
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- For graph table
CREATE POLICY "Allow all operations for anonymous" ON public.graph
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

Run these in the SQL Editor if you want to grant full access to anonymous users. 