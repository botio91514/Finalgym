const crypto = require('crypto');
const QRCode = require('qrcode');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getPlanAmount } = require('../utils/formatters');
const { sendEmail, createStorePurchaseSuccessEmail } = require('./emailService');

// UPI Payment Configuration
// PRIMARY UPI ID: 9898881882thanganat-1@okicici
// This UPI ID is used in payment QR codes, UPI intents, and when opening GPay/PhonePe/Paytm apps
// IMPORTANT: Always use the correct UPI ID for payments to ensure consistency
// Environment variables are checked but the correct UPI is always used for payments
const CORRECT_UPI_VPA = '9898881882thanganat-1@okicici';
const PAYEE_VPA = CORRECT_UPI_VPA; // Always use correct UPI for payments
const PAYEE_NAME = process.env.UPI_PAYEE_NAME || 'StarGym';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'changeme';

// Log UPI configuration on module load
console.log('✅ Payment Service - UPI_VPA configured:', PAYEE_VPA);
if (PAYEE_VPA === '9898881882thanganat-1@okicici') {
  console.log('✅ Payment Service - Correct UPI ID is being used: 9898881882thanganat-1@okicici');
}

const planToMonths = {
  '1month': 1,
  '2month': 2,
  '3month': 3,
  '6month': 6,
  yearly: 12
};

const generateOrderId = () =>
  `ORD-${crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex')}`;

const buildUpiIntent = ({ amount, orderId, note }) => {
  if (!PAYEE_VPA) {
    throw new Error('UPI_VPA is not configured');
  }

  const encodedNote = encodeURIComponent(note || `Gym subscription ${orderId}`);
  const encodedVPA = encodeURIComponent(PAYEE_VPA.trim());
  const encodedName = encodeURIComponent(PAYEE_NAME.trim());

  // UPI payment format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&cu=<Currency>&tn=<Note>&tr=<TransactionRef>
  // Important: First parameter uses ? and subsequent use &
  const upiIntent = `upi://pay?pa=${encodedVPA}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${orderId}`;

  return upiIntent;
};

const createPayment = async ({ userId, plan, amount }) => {
  if (!PAYEE_VPA) {
    throw new Error('UPI_VPA not configured');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const resolvedPlan = plan || user.plan;
  const resolvedAmount = amount || getPlanAmount(resolvedPlan);
  if (!resolvedAmount) {
    throw new Error('Unable to resolve amount for plan');
  }

  const orderId = generateOrderId();
  const upiIntent = buildUpiIntent({
    amount: resolvedAmount,
    orderId,
    note: `Subscription ${resolvedPlan}`
  });
  const qrImage = await QRCode.toDataURL(upiIntent, { margin: 1, scale: 6 });

  const payment = await Payment.create({
    user: userId,
    orderId,
    amount: resolvedAmount,
    currency: 'INR',
    status: 'created',
    upiIntent,
    qrImage,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    meta: { plan: resolvedPlan }
  });

  return { payment, user };
};

const createStorePayment = async ({ saleId, amount, customerName }) => {
  if (!PAYEE_VPA) {
    throw new Error('UPI_VPA not configured');
  }

  const orderId = generateOrderId();
  const upiIntent = buildUpiIntent({
    amount: parseFloat(amount),
    orderId,
    note: `Store Purchase ${orderId}`
  });
  const qrImage = await QRCode.toDataURL(upiIntent, { margin: 1, scale: 6 });

  const payment = await Payment.create({
    sale: saleId,
    orderId,
    amount: parseFloat(amount),
    currency: 'INR',
    status: 'created',
    upiIntent,
    qrImage,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    meta: { saleId, customerName }
  });

  return { payment };
};

const markPaymentPaid = async ({ orderId, transactionRef }) => {
  const payment = await Payment.findOne({ orderId });
  if (!payment) {
    throw new Error('Payment not found');
  }
  if (payment.status === 'paid') {
    return payment;
  }
  payment.status = 'paid';
  payment.transactionRef = transactionRef || payment.transactionRef || orderId;
  payment.paidAt = new Date();
  await payment.save();

  // Handle User Subscription
  if (payment.user) {
    const user = await User.findById(payment.user);
    if (user) {
      user.paymentStatus = 'confirmed';
      user.subscriptionStatus = 'active';

      // Ensure membership history entry exists
      if (!user.membershipHistory) {
        user.membershipHistory = [];
      }
      const months = planToMonths[user.plan] || 1;
      const amount = payment.amount;
      user.membershipHistory.push({
        type: 'join',
        date: new Date(),
        duration: String(months),
        amount,
        paymentMode: 'online',
        plan: user.plan,
        paymentStatus: 'confirmed',
        transactionId: payment.transactionRef
      });
      await user.save();
    }
  }

  // Handle Store Sale Payment
  if (payment.sale) {
    const StoreSale = require('../models/StoreSale');
    const SalePayment = require('../models/SalePayment');

    const sale = await StoreSale.findById(payment.sale);
    if (sale) {
      sale.paidAmount = payment.amount; // For store, usually full payment online
      sale.orderStatus = 'confirmed';
      sale.paymentStatus = 'paid';
      await sale.save();

      // Record in SalePayment
      await SalePayment.create({
        sale: sale._id,
        amount: payment.amount,
        paymentMode: 'online',
        receivedBy: 'System',
        transactionId: payment.transactionRef,
        notes: 'Automatically confirmed via online gateway'
      });

      // Send Success Email
      try {
        const fullSale = await StoreSale.findById(sale._id).populate('items.product').populate('member');
        const customerEmail = fullSale.member ? fullSale.member.email : fullSale.guestDetails?.email;
        const customerName = fullSale.member ? fullSale.member.name : fullSale.guestDetails?.name;

        if (customerEmail) {
          await sendEmail({
            email: customerEmail,
            subject: 'Purchase Successful - Star Gym Store 🎉',
            html: createStorePurchaseSuccessEmail(fullSale, customerName)
          });
        }
      } catch (mailError) {
        console.error('Failed to send online store payment email:', mailError);
      }
    }
  }

  return payment;
};

const markPaymentFailed = async ({ orderId, reason }) => {
  const payment = await Payment.findOne({ orderId });
  if (!payment) {
    throw new Error('Payment not found');
  }
  payment.status = 'failed';
  payment.meta = { ...payment.meta, reason };
  await payment.save();
  return payment;
};

const verifyWebhookSecret = (secret) => secret && secret === WEBHOOK_SECRET;

module.exports = {
  createPayment,
  createStorePayment,
  markPaymentPaid,
  markPaymentFailed,
  verifyWebhookSecret
};
