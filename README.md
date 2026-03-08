# Manual Payment Collection System

Next.js (App Router) + Prisma + PostgreSQL + Razorpay + TailwindCSS setup for collecting manual ticket payments.

## 1. Setup

```bash
npm install
cp .env.example .env
```

Update `.env` values:

- `DATABASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## 2. Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 3. Run

```bash
npm run dev
```

## Routes

- `/admin/create-payment` - create payment request
- `/pay/[paymentId]` - customer payment page
- `/payment-success` - payment success details
- `/admin/payments` - admin payments table
- `POST /api/payment/create`
- `POST /api/payment/verify`
- `POST /api/webhook/razorpay`

## Razorpay Webhook

Configure webhook URL:

`https://<your-domain>/api/webhook/razorpay`

Enable events:

- `payment.captured`
- `payment.failed`

. In India, solid alternatives to Razorpay are:

Cashfree Payments
Best for: fast startup onboarding, good API/webhook flow.
Links: https://www.cashfree.com/ , https://www.cashfree.com/payment-gateway-charges/

PayU
Best for: mature enterprise + startup support, broad payment options.
Links: https://payu.in/developer-guide , https://docs.payu.in/

PhonePe Payment Gateway
Best for: UPI-heavy businesses, high success-rate focus.
Links: https://www.phonepe.com/business-solutions/payment-gateway/ , https://www.phonepe.com/business-solutions/payment-gateway/pricing

Paytm Payment Gateway (PPSL)
Best for: omnichannel merchants already in Paytm ecosystem.
Links: https://business.paytm.com/pricing , https://www.paytmpayments.com/pricing

CCAvenue
Best for: legacy/large merchant acceptance and many payment instruments.
Links: https://www.ccavenue.com/ , https://www.ccavenue.com/pricing

Stripe (India)
Best for: strong global stack + clean developer UX.
Links: https://stripe.com/in/pricing

Instamojo
Best for: very small businesses/payment links/simple setup.
Links: https://www.instamojo.com/features/convenience-fee/ , https://support.instamojo.com/hc/en-us/articles/208482245-Instamojo-Transaction-Fees-No-Setup-or-Maintenance-Fees

If you want, I can switch your current codebase from Razorpay to Cashfree or PayU (both are straightforward replacements for your current order + verify + webhook architecture).