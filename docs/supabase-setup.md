# Supabase API setup

The backend reads and writes users, analysis history, and error reports through
Supabase's REST API. In
`SAT/backend/.env`, set the following values from **Supabase Dashboard > Project
Settings > API**:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_secret_key
```

Use the **secret** key, not the publishable key. Keep it on the backend only:
never commit it, add it to a `VITE_*` variable, or paste it into the frontend.

The existing `analysis_history` table must contain these columns (as in the
project's current table): `id`, `user_id`, `sentence`, `s_expression`,
`tree_json`, `sentence_type`, and `created_at`. The `id` and `user_id` columns
should remain integer-compatible with the application's existing user records.

After restarting the backend, sign in and analyze a sentence, then refresh the
Supabase Table Editor. A new `analysis_history` row should appear.
