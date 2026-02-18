const { Client } = require("pg");

async function run() {
  const c = new Client({
    connectionString:
      "postgresql://postgres.jweselmdlcbcgaodyogx:aprendizaje@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await c.connect();

    // Allow workspace owner to SELECT their own workspace (needed for .insert().select() chain)
    await c.query(`
      CREATE POLICY "Workspace owner can view own workspace"
        ON public.workspaces FOR SELECT
        USING (owner_id = auth.uid())
    `);
    console.log("SUCCESS: Owner SELECT policy added");

    // Also clean up any orphaned workspaces (created without members due to the bug)
    const { rows } = await c.query(`
      SELECT w.id FROM public.workspaces w
      LEFT JOIN public.workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.id IS NULL
    `);
    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      await c.query(`DELETE FROM public.workspaces WHERE id = ANY($1)`, [ids]);
      console.log(`Cleaned up ${rows.length} orphaned workspace(s)`);
    } else {
      console.log("No orphaned workspaces found");
    }

    await c.end();
  } catch (e) {
    console.log("FAIL:", e.message);
    await c.end().catch(() => {});
  }
}

run();
