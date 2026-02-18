export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "NoteFlow",
  description: "A modern workspace for your notes, docs, and collaboration.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;
