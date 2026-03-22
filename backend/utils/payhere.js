const crypto = require("crypto");

function normalizeEnvValue(value) {
  if (value == null) return "";
  return String(value).trim();
}

function formatAmount(amount) {
  const normalized = String(amount ?? "0").replace(/,/g, "").trim();
  const num = Number(normalized);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid payment amount: ${amount}`);
  }
  return num.toFixed(2);
}

function md5Hex(value) {
  return crypto.createHash("md5").update(String(value)).digest("hex");
}

function getMerchantSecretHash(merchantSecret) {
  return md5Hex(merchantSecret || "").toUpperCase();
}

function buildCheckoutHash({ merchantId, orderId, amount, currency, merchantSecret }) {
  const formattedAmount = formatAmount(amount);
  const secretHash = getMerchantSecretHash(merchantSecret);
  return md5Hex(`${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`).toUpperCase();
}

function buildNotifyMd5sig({ merchantId, orderId, payhereAmount, payhereCurrency, statusCode, merchantSecret }) {
  const secretHash = getMerchantSecretHash(merchantSecret);
  return md5Hex(
    `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`,
  ).toUpperCase();
}

function getPayHereCheckoutUrl() {
  const isSandbox = normalizeEnvValue(process.env.PAYHERE_SANDBOX || "true").toLowerCase() === "true";
  return isSandbox
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";
}

function getPayHereConfig() {
  const merchantId = normalizeEnvValue(process.env.PAYHERE_MERCHANT_ID);
  const merchantSecret = normalizeEnvValue(process.env.PAYHERE_MERCHANT_SECRET);
  const isSandbox = normalizeEnvValue(process.env.PAYHERE_SANDBOX || "true").toLowerCase() === "true";

  return {
    merchantId,
    merchantSecret,
    isSandbox,
    checkoutUrl: isSandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout",
  };
}

module.exports = {
  formatAmount,
  buildCheckoutHash,
  buildNotifyMd5sig,
  getPayHereCheckoutUrl,
  getPayHereConfig,
};
