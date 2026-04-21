import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { ContactsClient } from "./contacts-client";

export default async function ContactsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-8">
          <ContactsClient initialContacts={contacts} />
        </div>
      </main>
    </div>
  );
}
