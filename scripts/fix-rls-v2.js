require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

async function run() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await c.connect();

    // 1. Create SECURITY DEFINER helper functions (bypass RLS to break circular deps)
    await c.query(`
      CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
      RETURNS boolean AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = ws_id AND user_id = auth.uid()
        );
      $$ LANGUAGE sql SECURITY DEFINER STABLE;
    `);
    console.log("✓ Created is_workspace_member()");

    await c.query(`
      CREATE OR REPLACE FUNCTION public.is_workspace_owner(ws_id uuid)
      RETURNS boolean AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.workspaces
          WHERE id = ws_id AND owner_id = auth.uid()
        );
      $$ LANGUAGE sql SECURITY DEFINER STABLE;
    `);
    console.log("✓ Created is_workspace_owner()");

    await c.query(`
      CREATE OR REPLACE FUNCTION public.get_member_role(ws_id uuid)
      RETURNS text AS $$
        SELECT role FROM public.workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
        LIMIT 1;
      $$ LANGUAGE sql SECURITY DEFINER STABLE;
    `);
    console.log("✓ Created get_member_role()");

    // 2. Drop ALL existing policies on workspaces, workspace_members, pages, page_shares
    const tables = ["workspaces", "workspace_members", "pages", "page_shares"];
    for (const table of tables) {
      const { rows } = await c.query(
        `
        SELECT policyname FROM pg_policies WHERE tablename = $1 AND schemaname = 'public'
      `,
        [table],
      );
      for (const row of rows) {
        await c.query(
          `DROP POLICY IF EXISTS "${row.policyname}" ON public.${table}`,
        );
        console.log(`  ✗ Dropped policy "${row.policyname}" on ${table}`);
      }
    }

    // 3. Recreate policies using SECURITY DEFINER functions (no cross-table RLS)

    // -- WORKSPACES --
    await c.query(`
      CREATE POLICY "workspaces_select" ON public.workspaces FOR SELECT
      USING (owner_id = auth.uid() OR public.is_workspace_member(id))
    `);
    await c.query(`
      CREATE POLICY "workspaces_insert" ON public.workspaces FOR INSERT
      WITH CHECK (auth.uid() = owner_id)
    `);
    await c.query(`
      CREATE POLICY "workspaces_update" ON public.workspaces FOR UPDATE
      USING (owner_id = auth.uid())
    `);
    await c.query(`
      CREATE POLICY "workspaces_delete" ON public.workspaces FOR DELETE
      USING (owner_id = auth.uid())
    `);
    console.log("✓ Recreated workspaces policies");

    // -- WORKSPACE_MEMBERS --
    await c.query(`
      CREATE POLICY "wm_select" ON public.workspace_members FOR SELECT
      USING (public.is_workspace_member(workspace_id))
    `);
    await c.query(`
      CREATE POLICY "wm_insert" ON public.workspace_members FOR INSERT
      WITH CHECK (user_id = auth.uid() OR public.is_workspace_owner(workspace_id))
    `);
    await c.query(`
      CREATE POLICY "wm_update" ON public.workspace_members FOR UPDATE
      USING (public.is_workspace_owner(workspace_id))
    `);
    await c.query(`
      CREATE POLICY "wm_delete" ON public.workspace_members FOR DELETE
      USING (public.is_workspace_owner(workspace_id))
    `);
    console.log("✓ Recreated workspace_members policies");

    // -- PAGES --
    await c.query(`
      CREATE POLICY "pages_select" ON public.pages FOR SELECT
      USING (public.is_workspace_member(workspace_id) OR is_published = true)
    `);
    await c.query(`
      CREATE POLICY "pages_insert" ON public.pages FOR INSERT
      WITH CHECK (public.get_member_role(workspace_id) IN ('owner', 'editor'))
    `);
    await c.query(`
      CREATE POLICY "pages_update" ON public.pages FOR UPDATE
      USING (public.get_member_role(workspace_id) IN ('owner', 'editor'))
    `);
    await c.query(`
      CREATE POLICY "pages_delete" ON public.pages FOR DELETE
      USING (public.get_member_role(workspace_id) = 'owner' OR created_by = auth.uid())
    `);
    console.log("✓ Recreated pages policies");

    // -- PAGE_SHARES --
    await c.query(`
      CREATE POLICY "shares_select" ON public.page_shares FOR SELECT
      USING (
        shared_with_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.pages p
          WHERE p.id = page_id AND public.is_workspace_member(p.workspace_id)
        )
      )
    `);
    await c.query(`
      CREATE POLICY "shares_manage" ON public.page_shares FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.pages p
          WHERE p.id = page_id AND public.get_member_role(p.workspace_id) IN ('owner', 'editor')
        )
      )
    `);
    console.log("✓ Recreated page_shares policies");

    // 4. Clean up orphaned workspaces
    const { rows: orphans } = await c.query(`
      SELECT w.id FROM public.workspaces w
      LEFT JOIN public.workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.id IS NULL
    `);
    if (orphans.length > 0) {
      await c.query(`DELETE FROM public.workspaces WHERE id = ANY($1)`, [
        orphans.map((r) => r.id),
      ]);
      console.log(`✓ Cleaned ${orphans.length} orphaned workspace(s)`);
    }

    console.log("\n✅ All RLS policies fixed successfully!");
    await c.end();
  } catch (e) {
    console.log("FAIL:", e.message);
    await c.end().catch(() => {});
  }
}

run();
