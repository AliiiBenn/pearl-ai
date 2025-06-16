import { Eclipse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Pricing2 } from "./components/pricinng-cards";
import { Polar } from "@polar-sh/sdk";
import { Ingestion } from "@polar-sh/ingestion";

const polar = new Polar({
  accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
  server: "sandbox",
});

const ingestion = Ingestion({
  accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
})

export default async function Page() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  console.log(await polar.customers.getStateExternal({ externalId: user?.id }))



  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/">
          <Eclipse />
        </Link>
        <UserNav user={user || { id: "", email: "" }} />
      </header>
      <main className="flex-grow p-4">
        <Pricing2 />
      </main>
    </div>
  );
}

