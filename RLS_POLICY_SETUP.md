# Supabase Row Level Security Policy Setup

Follow these steps to configure Row Level Security (RLS) policies for the Topic Explorer application:

## Step 1: Access Your Supabase Dashboard

1. Go to https://app.supabase.com/ and log in
2. Select your project

## Step 2: Configure RLS Policies for the "topics" Table

1. Navigate to **Table Editor** in the sidebar
2. Select the **topics** table
3. Click on **Authentication** tab (or the "Policies" button)
4. Click **New Policy**
5. Select **INSERT** for policy type
6. Use these settings:
   - Policy name: `allow_anonymous_inserts`
   - Using template: `Custom`
   - Policy definition: `true` (to allow all inserts)
   - Or use this policy if you want to restrict by session ID: `auth.uid() IS NULL` (for anonymous access)
7. Click **Save Policy**

## Step 3: Configure RLS Policies for the "graph" Table

1. Navigate back to **Table Editor**
2. Select the **graph** table
3. Click on **Authentication** tab (or the "Policies" button)
4. Click **New Policy**
5. Select **INSERT** for policy type
6. Use these settings:
   - Policy name: `allow_anonymous_inserts`
   - Using template: `Custom` 
   - Policy definition: `true` (to allow all inserts)
   - Or use this policy if you want to restrict by session ID: `auth.uid() IS NULL` (for anonymous access)
7. Click **Save Policy**

## Step 4: Verify Your Policies

After setting up these policies, both tables should allow:
- SELECT operations (which were already working)
- INSERT operations (which should now work)

If you need DELETE or UPDATE operations to work for anonymous users, you'll need to create separate policies for those actions too.

## Note on Security

Allowing anonymous inserts means anyone with your public API key can insert data into your tables. Consider adding validation or rate limiting if this is a production app.

If you're using client-side validation only, be aware that malicious users can bypass it. For more security:

1. Use Supabase Edge Functions for server-side validation
2. Add database triggers to validate data before it's stored
3. Consider implementing user authentication for more control 