import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import {
  getWorkspacesForUser,
  createWorkspace,
} from "@/services/workspace.service";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileEdit, FolderTree, Users, Search, Moon, Zap } from "lucide-react";

export default async function RootPage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // Supabase not configured — show landing page
    return <LandingPage />;
  }

  if (!user) {
    return <LandingPage />;
  }

  const workspaces = await getWorkspacesForUser(user.id);

  if (workspaces.length > 0) {
    redirect(`/${workspaces[0].id}`);
  }

  const workspace = await createWorkspace(
    `${user.full_name || user.email}'s Workspace`,
    user.id,
  );

  if (workspace) {
    redirect(`/${workspace.id}`);
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Setting up your workspace...</p>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              N
            </div>
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your ideas,{" "}
            <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              organized
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {siteConfig.description} Create, collaborate, and bring your best
            work to life — all in one flexible workspace.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start for free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FileEdit,
              title: "Rich Text Editor",
              desc: "Block-based editor with Markdown support, task lists, code blocks, and more.",
            },
            {
              icon: FolderTree,
              title: "Nested Pages",
              desc: "Organize your documents in a tree structure with infinite nesting.",
            },
            {
              icon: Users,
              title: "Collaboration",
              desc: "Share pages with your team. Owner, editor, and viewer roles.",
            },
            {
              icon: Search,
              title: "Quick Search",
              desc: "Find any page instantly with powerful full-text search.",
            },
            {
              icon: Moon,
              title: "Dark Mode",
              desc: "Beautiful dark and light themes that respect your system preference.",
            },
            {
              icon: Zap,
              title: "Auto-save",
              desc: "Never lose your work. Changes are saved automatically as you type.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 text-left transition-shadow hover:shadow-md"
            >
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js,
          Supabase &amp; TipTap.
        </div>
      </footer>
    </div>
  );
}
