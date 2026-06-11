import { getPartnerPromoCodes } from "@/actions/partner-promos";
import { PromoCodesManager } from "@/components/partner/promo-codes-manager";
import { redirect } from "next/navigation";

export default async function PartnerPromosPage() {
  const promos = await getPartnerPromoCodes();
  if (promos === null) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">Промокоды</h1>
      <p className="mt-1 text-muted">Создание и управление скидками</p>
      <div className="mt-6">
        <PromoCodesManager promos={promos} />
      </div>
    </div>
  );
}
