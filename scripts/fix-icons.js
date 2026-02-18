require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");
async function run() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await c.connect();
    await c.query(
      `ALTER TABLE public.pages ALTER COLUMN icon SET DEFAULT 'file-text'`,
    );
    const { rowCount } = await c.query(
      `UPDATE public.pages SET icon = 'file-text' WHERE icon IS NULL OR icon NOT IN (SELECT unnest(ARRAY['file-text','file-code','file-spreadsheet','folder','folder-open','book-open','bookmark','lightbulb','target','rocket','star','flame','gem','palette','music','monitor','wrench','bar-chart','trending-up','folder-kanban','tag','pin','link','check-circle','x-circle','zap','sparkles','message-circle','mail','calendar','clock','home','globe','party-popper','bot','ruler','puzzle','key','settings','heart','shield','camera','coffee','code','database','layers','map','users','bell','search','award']))`,
    );
    console.log(
      `SUCCESS: Updated ${rowCount} page(s) to use Lucide icon names`,
    );
    await c.end();
  } catch (e) {
    console.log("FAIL:", e.message);
    await c.end().catch(() => {});
  }
}
run();
