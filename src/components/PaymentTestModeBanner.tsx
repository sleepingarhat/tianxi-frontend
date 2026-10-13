const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken || !clientToken.startsWith("pk_test_")) return null;
  return (
    <div className="w-full border-b border-gold-strong/40 bg-gold-bg px-4 py-2 text-center text-[12px] text-gold">
      預覽版付款為測試模式，唔會扣真錢。
    </div>
  );
}
