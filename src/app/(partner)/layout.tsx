import { PartnerSidebar } from "@/components/partner/partner-sidebar";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <PartnerSidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
