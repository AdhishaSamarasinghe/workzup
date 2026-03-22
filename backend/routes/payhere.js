const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { buildNotifyMd5sig, getPayHereConfig } = require("../utils/payhere");

const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

function getApiBaseUrl(req) {
  return process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function getClientBaseUrl() {
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000";
}

// POST /api/payhere/notify
router.post("/notify", async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body || {};

    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      return res.status(400).send("Missing required parameters");
    }

    const { merchantId, merchantSecret } = getPayHereConfig();

    if (!merchantId || !merchantSecret) {
      return res.status(500).send("PayHere not configured");
    }

    const expectedSig = buildNotifyMd5sig({
      merchantId,
      orderId: String(order_id),
      payhereAmount: String(payhere_amount),
      payhereCurrency: String(payhere_currency),
      statusCode: String(status_code),
      merchantSecret,
    });

    if (String(md5sig).toUpperCase() !== expectedSig) {
      return res.status(400).send("Invalid signature");
    }

    const payment = await prisma.payment.findUnique({
      where: { id: String(order_id) },
      include: {
        job: true,
        worker: true,
      },
    });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    if (payment.status === "COMPLETED") {
      return res.status(200).send("OK");
    }

    const incomingAmount = Number(payhere_amount);
    const dbAmount = Number(payment.amount).toFixed(2);
    const sameAmount = Number.isFinite(incomingAmount) && incomingAmount.toFixed(2) === dbAmount;
    const sameCurrency = String(payhere_currency).toUpperCase() === String(payment.currency || "").toUpperCase();

    if (!sameAmount || !sameCurrency) {
      return res.status(400).send("Amount or currency mismatch");
    }

    const normalizedStatus = String(status_code) === "2" ? "COMPLETED" : "FAILED";

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: normalizedStatus,
        completionDate: normalizedStatus === "COMPLETED" ? new Date() : payment.completionDate,
      },
    });

    if (normalizedStatus === "COMPLETED") {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: { status: "COMPLETED" },
      });

      const workerProfile = await prisma.seekerProfile.findUnique({
        where: { userId: payment.workerId },
      });

      if (workerProfile) {
        const currentExp = workerProfile.experience || [];
        const dateObj = payment.completionDate ? new Date(payment.completionDate) : new Date();
        const formattedDate = dateObj.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        const newExperience = {
          id: `${Date.now()}-${payment.id}`,
          title: payment.job?.title || "Completed job",
          company: "Workzup Platform",
          duration: `${formattedDate}`,
          description: "Successfully completed hourly job via Workzup.",
        };

        await prisma.seekerProfile.update({
          where: { userId: payment.workerId },
          data: {
            experience: [...currentExp, newExperience],
          },
        });
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PayHere notify error:", error);
    return res.status(500).send("Server Error");
  }
});

// GET /api/payhere/return
router.get("/return", (req, res) => {
  const clientBase = getClientBaseUrl();
  const paymentId = encodeURIComponent(String(req.query.order_id || ""));
  res.redirect(`${clientBase}/recruiter/payment-result?status=success&paymentId=${paymentId}`);
});

// GET /api/payhere/cancel
router.get("/cancel", (req, res) => {
  const clientBase = getClientBaseUrl();
  const paymentId = encodeURIComponent(String(req.query.order_id || ""));
  res.redirect(`${clientBase}/recruiter/payment-result?status=cancelled&paymentId=${paymentId}`);
});

// GET /api/payhere/payment/:paymentId
router.get(
  "/payment/:paymentId",
  authenticateToken,
  requireRole(["EMPLOYER", "RECRUITER", "ADMIN"]),
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { job: true },
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const isAdmin = String(req.user?.role || "").toUpperCase() === "ADMIN";
      const isOwner = String(payment.job?.employerId || "") === String(req.user?.userId || "");
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      return res.json({
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        jobId: payment.jobId,
      });
    } catch (error) {
      console.error("PayHere payment status error:", error);
      return res.status(500).json({ message: "Server Error" });
    }
  },
);

// GET /api/payhere/config
router.get("/config", (req, res) => {
  const { merchantId, merchantSecret, isSandbox, checkoutUrl } = getPayHereConfig();
  const apiBaseUrl = getApiBaseUrl(req);
  return res.json({
    configured: Boolean(merchantId && merchantSecret),
    merchantId: merchantId || null,
    mode: isSandbox ? "SANDBOX" : "LIVE",
    checkoutUrl,
    notifyUrl: `${apiBaseUrl}/api/payhere/notify`,
  });
});

module.exports = router;
