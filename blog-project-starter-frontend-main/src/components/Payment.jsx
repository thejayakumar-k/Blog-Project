import { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../i18n/useLanguage";
import LanguageSwitcher from "./payment/LanguageSwitcher";

const backendUrl = import.meta.env.VITE_API_URL;

const product = {
  name: "Premium Drinking Water",
  vendor: "Aqua Fresh Water",
  canSize: "20 Litres",
  pricePerCan: 20,
  deposit: 0,
};

function Payment() {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const subtotal = quantity * product.pricePerCan;
  const platformFee = parseFloat((subtotal * 0.0195).toFixed(2));
  const gst = parseFloat((platformFee * 0.18).toFixed(2));
  const grandTotal = parseFloat((subtotal + platformFee + gst).toFixed(2));

  const [paymentState, setPaymentState] = useState("idle");
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBuyNow = async () => {
    try {
      const { data: orderData } = await axios.post(`${backendUrl}/api/payment/orders`, {
        amount: grandTotal,
      });

      const orderId = orderData.data.order_id;
      const paymentSessionId = orderData.data.payment_session_id;

      const cashfree = window.Cashfree({ mode: "sandbox" });

      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_modal",
        onSuccess: async () => {
          try {
            const { data } = await axios.post(`${backendUrl}/api/payment/verify`, {
              order_id: orderId,
            });

            if (data.order_status === "PAID") {
              setPaymentMessage(t("paymentSuccessMsg"));
            } else {
              setPaymentMessage(t("paymentProcessing"));
            }
          } catch (err) {
            console.error("Verification failed:", err);
            setPaymentMessage(t("paymentReceived"));
          }
          setPaymentState("success");
        },
        onFailure: () => {
          setPaymentMessage(t("paymentFailedMsg"));
          setPaymentState("failed");
        },
      });
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setPaymentMessage(t("paymentInitError"));
      setPaymentState("failed");
    }
  };

  const resetPayment = () => {
    setPaymentState("idle");
    setPaymentMessage("");
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04),0_24px_60px_rgba(0,119,182,0.08)] flex flex-col max-h-full border border-white/60">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0 bg-white/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0077b6] to-[#0096c7] flex items-center justify-center shadow-sm shadow-[#0077b6]/20">
              <span className="text-xs">💧</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold text-sm leading-tight tracking-tight">{t("brand")}</span>
              <span className="text-[8px] text-gray-400 font-medium uppercase tracking-[0.15em] leading-tight">{t("orderSummary")}</span>
            </div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/40"></div>
          <LanguageSwitcher />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Body */}
        <div className="flex-1 overflow-hidden px-5 py-5 flex flex-col gap-3.5">

          {/* Product Card */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2] flex items-center justify-center shrink-0 shadow-inner shadow-[#b2ebf2]/50 border border-white/80">
              <svg className="w-8 h-10" viewBox="0 0 64 80" fill="none">
                <rect x="24" y="2" width="16" height="8" rx="4" fill="#0077b6" />
                <rect x="20" y="8" width="24" height="8" rx="3" fill="#005f8e" />
                <rect x="10" y="16" width="44" height="56" rx="8" fill="#0096c7" />
                <rect x="10" y="36" width="44" height="36" rx="8" fill="#48cae4" />
                <rect x="16" y="30" width="32" height="20" rx="4" fill="white" opacity="0.9" />
                <text x="32" y="43" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0077b6">20L</text>
                <rect x="16" y="18" width="6" height="20" rx="3" fill="white" opacity="0.3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate leading-tight tracking-tight">{t("productName")}</h2>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{t("vendor")}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-100/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[9px] text-emerald-600 font-semibold">{t("inStock")}</span>
                </div>
                <span className="text-[9px] text-gray-300">·</span>
                <span className="text-[9px] text-gray-400 font-medium">{t("readyToDeliver")}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Info Rows */}
          <div className="flex flex-col gap-0">
            <div className="flex items-center justify-between py-2">
              <span className="text-[11px] text-gray-400 font-medium">{t("canSize")}</span>
              <span className="text-[11px] font-semibold text-gray-600">{t("canSizeValue")}</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2">
              <span className="text-[11px] text-gray-400 font-medium">{t("quantity")}</span>
              <div className="flex items-center gap-0.5 bg-gray-50 rounded-full p-0.5 border border-gray-100">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-xs transition-all duration-200 active:scale-90 shadow-sm border border-gray-100"
                >
                  −
                </button>
                <span className="text-xs font-bold text-gray-900 w-6 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-xs transition-all duration-200 active:scale-90 shadow-sm border border-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[11px] text-gray-400 font-medium">{t("pricePerCan")}</span>
              <span className="text-[11px] font-semibold text-gray-600">₹{product.pricePerCan}</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl px-4 py-3.5 flex flex-col gap-1.5 border border-[#0077b6]/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">{t("subtotal")}</span>
              <span className="text-[11px] font-semibold text-gray-600">₹{subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">{t("platformFee")}</span>
              <span className="text-[11px] font-semibold text-gray-600">₹{platformFee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">{t("gst")}</span>
              <span className="text-[11px] font-semibold text-gray-600">₹{gst}</span>
            </div>
            <div className="h-px bg-[#0077b6]/10 my-0.5"></div>
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-[0.15em]">{t("total")}</p>
              <span className="text-2xl font-extrabold text-[#0077b6] tracking-tight">₹{grandTotal}</span>
            </div>
          </div>

          {/* Payment Button */}
          {paymentState === "idle" && (
            <button
              onClick={handleBuyNow}
              className="w-full bg-gradient-to-r from-[#0077b6] to-[#006da3] hover:from-[#006da3] hover:to-[#005f8e] text-white font-semibold text-sm py-3 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-[#0077b6]/20 hover:shadow-xl hover:shadow-[#0077b6]/25 flex items-center justify-center gap-2"
            >
              <span>{t("proceedToPayment")}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}

          {/* Success */}
          {paymentState === "success" && (
            <div className="flex flex-col items-center gap-3 py-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 mb-0.5">{t("paymentSuccessful")}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed max-w-52">{paymentMessage}</p>
              </div>
              <button
                onClick={resetPayment}
                className="text-[10px] text-[#0077b6] hover:text-[#005f8e] font-semibold transition-colors"
              >
                {t("makeAnotherPayment")}
              </button>
            </div>
          )}

          {/* Failed */}
          {paymentState === "failed" && (
            <div className="flex flex-col items-center gap-3 py-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shadow-lg shadow-red-500/10">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 mb-0.5">{t("paymentFailed")}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed max-w-52">{paymentMessage}</p>
              </div>
              <button
                onClick={resetPayment}
                className="w-full max-w-40 bg-gradient-to-r from-[#0077b6] to-[#006da3] hover:from-[#006da3] hover:to-[#005f8e] text-white font-semibold text-xs py-2.5 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-[#0077b6]/20"
              >
                {t("tryAgain")}
              </button>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="px-5 pb-4 pt-0 shrink-0">
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] text-gray-300 font-medium tracking-wide">{t("securedBy")}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Payment;
