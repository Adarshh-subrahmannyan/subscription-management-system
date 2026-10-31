import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const prisma = new PrismaClient();

async function upsertCustomer(email: string, data: {
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;
}) {
  const existing = await prisma.customer.findFirst({ where: { email } });
  if (existing) return existing;
  return prisma.customer.create({ data });
}

async function main() {
  console.log("🌱 Seeding database…");

  // ── Users ──────────────────────────────────────────────────────────────
  const adminHash = await hashPassword("Admin@123");
  const staffHash = await hashPassword("Staff@123");
  const cust1Hash = await hashPassword("Customer@123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@subscript.dev" },
    update: { passwordHash: adminHash, role: "admin", name: "Admin User" },
    create: { email: "admin@subscript.dev", name: "Admin User", role: "admin", passwordHash: adminHash },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@subscript.dev" },
    update: { passwordHash: staffHash, role: "staff", name: "Staff Member" },
    create: { email: "staff@subscript.dev", name: "Staff Member", role: "staff", passwordHash: staffHash },
  });

  const custUser1 = await prisma.user.upsert({
    where: { email: "acme@subscript.dev" },
    update: { passwordHash: cust1Hash, role: "customer", name: "Acme Corp" },
    create: { email: "acme@subscript.dev", name: "Acme Corp", role: "customer", passwordHash: cust1Hash },
  });

  console.log("✅ Users created");

  // ── Customers ──────────────────────────────────────────────────────────
  const customer1 = await upsertCustomer("acme@subscript.dev", {
    userId: custUser1.id,
    name: "Acme Corp",
    email: "acme@subscript.dev",
    phone: "+91-9876543210",
    address: "12 Business Park, Mumbai, MH 400001",
    active: true,
  });

  const customer2 = await upsertCustomer("info@techstart.io", {
    name: "TechStart Ltd",
    email: "info@techstart.io",
    phone: "+91-9988776655",
    address: "45 Cyber City, Gurugram, HR 122001",
    active: true,
  });

  const customer3 = await upsertCustomer("ops@greenleaf.co", {
    name: "GreenLeaf Inc",
    email: "ops@greenleaf.co",
    phone: "+91-8765432109",
    address: "7 Eco Tower, Bangalore, KA 560001",
    active: true,
  });

  const customer4 = await upsertCustomer("billing@horizonmedia.in", {
    name: "Horizon Media",
    email: "billing@horizonmedia.in",
    phone: "+91-7654321098",
    address: "89 Media Hub, Hyderabad, TS 500001",
    active: false,
  });

  console.log("✅ Customers created");

  // ── Products ──────────────────────────────────────────────────────────
  const productCRM = await prisma.product.upsert({
    where: { id: "prod-crm-001" },
    update: {},
    create: {
      id: "prod-crm-001",
      name: "CRM Pro",
      type: "service",
      salesPrice: 500000,
      costPrice: 200000,
      notes: "Full-featured CRM solution with advanced analytics",
      active: true,
    },
  });

  const productSupport = await prisma.product.upsert({
    where: { id: "prod-support-001" },
    update: {},
    create: {
      id: "prod-support-001",
      name: "Priority Support",
      type: "service",
      salesPrice: 250000,
      costPrice: 80000,
      notes: "24/7 priority support with 1-hour SLA",
      active: true,
    },
  });

  const productStorage = await prisma.product.upsert({
    where: { id: "prod-storage-001" },
    update: {},
    create: {
      id: "prod-storage-001",
      name: "Cloud Storage 100GB",
      type: "service",
      salesPrice: 50000,
      costPrice: 15000,
      notes: "100GB encrypted cloud storage",
      active: true,
      variants: {
        create: [
          { name: "500GB", priceDelta: 150000, active: true },
          { name: "1TB", priceDelta: 350000, active: true },
        ],
      },
    },
  });

  const productOnboarding = await prisma.product.upsert({
    where: { id: "prod-onboarding-001" },
    update: {},
    create: {
      id: "prod-onboarding-001",
      name: "Onboarding Package",
      type: "one_time",
      salesPrice: 1500000,
      costPrice: 500000,
      notes: "One-time setup and onboarding for new customers",
      active: true,
    },
  });

  console.log("✅ Products created");

  // ── Plans ──────────────────────────────────────────────────────────────
  const planStarter = await prisma.plan.upsert({
    where: { id: "plan-starter-001" },
    update: {},
    create: {
      id: "plan-starter-001",
      name: "Starter",
      description: "Perfect for small teams getting started",
      price: 250000,
      billingFrequency: "monthly",
      minimumQuantity: 1,
      allowPause: false,
      allowRenewal: true,
      allowEarlyClosure: true,
      autoClose: false,
      active: true,
      items: {
        create: [{ productId: productStorage.id, quantity: 1 }],
      },
    },
  });

  const planPro = await prisma.plan.upsert({
    where: { id: "plan-pro-001" },
    update: {},
    create: {
      id: "plan-pro-001",
      name: "Professional",
      description: "For growing businesses needing more power",
      price: 500000,
      billingFrequency: "monthly",
      minimumQuantity: 1,
      allowPause: true,
      allowRenewal: true,
      allowEarlyClosure: true,
      autoClose: false,
      active: true,
      items: {
        create: [
          { productId: productCRM.id, quantity: 1 },
          { productId: productStorage.id, quantity: 1 },
        ],
      },
    },
  });

  const planEnterprise = await prisma.plan.upsert({
    where: { id: "plan-enterprise-001" },
    update: {},
    create: {
      id: "plan-enterprise-001",
      name: "Enterprise Suite",
      description: "Full-featured enterprise solution with premium support",
      price: 1200000,
      billingFrequency: "monthly",
      minimumQuantity: 3,
      allowPause: true,
      allowRenewal: true,
      allowEarlyClosure: false,
      autoClose: false,
      active: true,
      items: {
        create: [
          { productId: productCRM.id, quantity: 1 },
          { productId: productSupport.id, quantity: 1 },
          { productId: productStorage.id, quantity: 1 },
        ],
      },
    },
  });

  console.log("✅ Plans created");

  // ── Discounts ──────────────────────────────────────────────────────────
  const existingDisc1 = await prisma.discount.findUnique({ where: { id: "disc-launch-001" } });
  if (!existingDisc1) {
    await prisma.discount.create({
      data: {
        id: "disc-launch-001",
        name: "Launch Offer 20%",
        kind: "percentage",
        value: 2000,
        minimumPurchase: 500000,
        usageLimit: 50,
        usageCount: 12,
        startsAt: new Date("2026-10-01"),
        endsAt: new Date("2026-12-31"),
        active: true,
      },
    });
  }

  const existingDisc2 = await prisma.discount.findUnique({ where: { id: "disc-fixed-001" } });
  if (!existingDisc2) {
    await prisma.discount.create({
      data: {
        id: "disc-fixed-001",
        name: "New Customer ₹500 Off",
        kind: "fixed",
        value: 50000,
        minimumPurchase: 200000,
        usageLimit: 100,
        usageCount: 34,
        active: true,
      },
    });
  }

  const existingDisc3 = await prisma.discount.findUnique({ where: { id: "disc-annual-001" } });
  if (!existingDisc3) {
    await prisma.discount.create({
      data: {
        id: "disc-annual-001",
        name: "Annual Commitment 15%",
        kind: "percentage",
        value: 1500,
        minimumQuantity: 1,
        active: true,
      },
    });
  }

  console.log("✅ Discounts created");

  // ── Subscriptions ──────────────────────────────────────────────────────
  const sub1 = await prisma.subscription.upsert({
    where: { number: "SUB-1698763200-0001" },
    update: {},
    create: {
      number: "SUB-1698763200-0001",
      customerId: customer1.id,
      planId: planEnterprise.id,
      status: "active",
      startDate: new Date("2026-10-01"),
      nextBillingDate: new Date("2026-11-01"),
      paymentTerms: "net_30",
      lines: {
        create: [
          { productId: productCRM.id, quantity: 5, unitPrice: 500000, taxAmount: 45000, amount: 2545000 },
          { productId: productSupport.id, quantity: 1, unitPrice: 250000, taxAmount: 22500, amount: 272500 },
          { productId: productStorage.id, quantity: 5, unitPrice: 50000, taxAmount: 22500, amount: 272500 },
        ],
      },
    },
  });

  const sub2 = await prisma.subscription.upsert({
    where: { number: "SUB-1698763200-0002" },
    update: {},
    create: {
      number: "SUB-1698763200-0002",
      customerId: customer2.id,
      planId: planPro.id,
      status: "active",
      startDate: new Date("2026-10-15"),
      nextBillingDate: new Date("2026-11-15"),
      paymentTerms: "net_15",
      lines: {
        create: [
          { productId: productCRM.id, quantity: 2, unitPrice: 500000, taxAmount: 18000, amount: 1018000 },
          { productId: productStorage.id, quantity: 2, unitPrice: 50000, taxAmount: 9000, amount: 109000 },
        ],
      },
    },
  });

  await prisma.subscription.upsert({
    where: { number: "SUB-1698763200-0003" },
    update: {},
    create: {
      number: "SUB-1698763200-0003",
      customerId: customer3.id,
      planId: planStarter.id,
      status: "draft",
      startDate: new Date("2026-11-01"),
      nextBillingDate: new Date("2026-11-01"),
      lines: {
        create: [
          { productId: productStorage.id, quantity: 1, unitPrice: 50000, taxAmount: 9000, amount: 59000 },
        ],
      },
    },
  });

  const sub4 = await prisma.subscription.upsert({
    where: { number: "SUB-1698763200-0004" },
    update: {},
    create: {
      number: "SUB-1698763200-0004",
      customerId: customer4.id,
      planId: planEnterprise.id,
      status: "closed",
      startDate: new Date("2026-08-01"),
      closedAt: new Date("2026-10-01"),
      lines: {
        create: [
          { productId: productCRM.id, quantity: 10, unitPrice: 500000, taxAmount: 90000, amount: 5090000 },
          { productId: productSupport.id, quantity: 1, unitPrice: 250000, taxAmount: 22500, amount: 272500 },
          { productId: productStorage.id, quantity: 10, unitPrice: 50000, taxAmount: 45000, amount: 545000 },
        ],
      },
    },
  });

  console.log("✅ Subscriptions created");

  // ── Invoices ──────────────────────────────────────────────────────────
  const inv1 = await prisma.invoice.upsert({
    where: { number: "INV-2026-0001" },
    update: {},
    create: {
      number: "INV-2026-0001",
      customerId: customer1.id,
      subscriptionId: sub1.id,
      billingPeriod: "2026-10",
      status: "paid",
      issuedAt: new Date("2026-10-01"),
      dueAt: new Date("2026-10-31"),
      subtotal: 3090000,
      taxTotal: 90000,
      discountTotal: 0,
      total: 3180000,
      paidAmount: 3180000,
      lines: {
        create: [
          { productId: productCRM.id, description: "CRM Pro × 5", quantity: 5, unitPrice: 500000, taxAmount: 45000, amount: 2545000 },
          { productId: productSupport.id, description: "Priority Support × 1", quantity: 1, unitPrice: 250000, taxAmount: 22500, amount: 272500 },
          { productId: productStorage.id, description: "Cloud Storage × 5", quantity: 5, unitPrice: 50000, taxAmount: 22500, amount: 272500 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { number: "INV-2026-0002" },
    update: {},
    create: {
      number: "INV-2026-0002",
      customerId: customer1.id,
      subscriptionId: sub1.id,
      billingPeriod: "2026-11",
      status: "pending",
      issuedAt: new Date("2026-11-01"),
      dueAt: new Date("2026-11-30"),
      subtotal: 3090000,
      taxTotal: 90000,
      discountTotal: 0,
      total: 3180000,
      paidAmount: 0,
      lines: {
        create: [
          { productId: productCRM.id, description: "CRM Pro × 5", quantity: 5, unitPrice: 500000, taxAmount: 45000, amount: 2545000 },
          { productId: productSupport.id, description: "Priority Support × 1", quantity: 1, unitPrice: 250000, taxAmount: 22500, amount: 272500 },
          { productId: productStorage.id, description: "Cloud Storage × 5", quantity: 5, unitPrice: 50000, taxAmount: 22500, amount: 272500 },
        ],
      },
    },
  });

  const inv3 = await prisma.invoice.upsert({
    where: { number: "INV-2026-0003" },
    update: {},
    create: {
      number: "INV-2026-0003",
      customerId: customer2.id,
      subscriptionId: sub2.id,
      billingPeriod: "2026-10",
      status: "paid",
      issuedAt: new Date("2026-10-15"),
      dueAt: new Date("2026-10-30"),
      subtotal: 1100000,
      taxTotal: 27000,
      discountTotal: 0,
      total: 1127000,
      paidAmount: 1127000,
      lines: {
        create: [
          { productId: productCRM.id, description: "CRM Pro × 2", quantity: 2, unitPrice: 500000, taxAmount: 18000, amount: 1018000 },
          { productId: productStorage.id, description: "Cloud Storage × 2", quantity: 2, unitPrice: 50000, taxAmount: 9000, amount: 109000 },
        ],
      },
    },
  });

  const inv4 = await prisma.invoice.upsert({
    where: { number: "INV-2026-0004" },
    update: {},
    create: {
      number: "INV-2026-0004",
      customerId: customer4.id,
      subscriptionId: sub4.id,
      billingPeriod: "2026-08",
      status: "paid",
      issuedAt: new Date("2026-08-01"),
      dueAt: new Date("2026-08-31"),
      subtotal: 5540000,
      taxTotal: 157500,
      discountTotal: 0,
      total: 5697500,
      paidAmount: 5697500,
      lines: {
        create: [
          { productId: productCRM.id, description: "CRM Pro × 10", quantity: 10, unitPrice: 500000, taxAmount: 90000, amount: 5090000 },
          { productId: productSupport.id, description: "Priority Support × 1", quantity: 1, unitPrice: 250000, taxAmount: 22500, amount: 272500 },
          { productId: productStorage.id, description: "Cloud Storage × 10", quantity: 10, unitPrice: 50000, taxAmount: 45000, amount: 545000 },
        ],
      },
    },
  });

  // Overdue invoice
  await prisma.invoice.upsert({
    where: { number: "INV-2026-0005" },
    update: {},
    create: {
      number: "INV-2026-0005",
      customerId: customer3.id,
      billingPeriod: "2026-09",
      status: "pending",
      issuedAt: new Date("2026-09-01"),
      dueAt: new Date("2026-09-30"),
      subtotal: 50000,
      taxTotal: 9000,
      discountTotal: 0,
      total: 59000,
      paidAmount: 0,
      lines: {
        create: [
          { productId: productStorage.id, description: "Cloud Storage × 1", quantity: 1, unitPrice: 50000, taxAmount: 9000, amount: 59000 },
        ],
      },
    },
  });

  console.log("✅ Invoices created");

  // ── Payments ──────────────────────────────────────────────────────────
  const existingPay1 = await prisma.payment.findFirst({ where: { invoiceId: inv1.id, amount: 3180000 } });
  if (!existingPay1) {
    await prisma.payment.create({
      data: {
        invoiceId: inv1.id,
        method: "bank_transfer",
        amount: 3180000,
        paidAt: new Date("2026-10-05"),
        reference: "TXN-ACC-20261005-001",
        note: "Full payment received",
      },
    });
  }

  const existingPay2 = await prisma.payment.findFirst({ where: { invoiceId: inv3.id, amount: 1127000 } });
  if (!existingPay2) {
    await prisma.payment.create({
      data: {
        invoiceId: inv3.id,
        method: "upi",
        amount: 1127000,
        paidAt: new Date("2026-10-18"),
        reference: "UPI-20261018-Tech",
        note: null,
      },
    });
  }

  const existingPay3 = await prisma.payment.findFirst({ where: { invoiceId: inv4.id, amount: 5697500 } });
  if (!existingPay3) {
    await prisma.payment.create({
      data: {
        invoiceId: inv4.id,
        method: "card",
        amount: 5697500,
        paidAt: new Date("2026-08-03"),
        reference: "CARD-20260803-HZN",
        note: "Paid by card on file",
      },
    });
  }

  console.log("✅ Payments created");

  // ── Quotations ──────────────────────────────────────────────────────────
  await prisma.quotation.upsert({
    where: { number: "QT-1698763200-0001" },
    update: {},
    create: {
      number: "QT-1698763200-0001",
      customerId: customer3.id,
      planId: planPro.id,
      createdById: admin.id,
      status: "draft",
      validUntil: new Date("2026-12-31"),
      subtotal: 500000,
      taxTotal: 90000,
      discountTotal: 0,
      total: 590000,
      lines: {
        create: [
          { productId: productCRM.id, quantity: 1, unitPrice: 500000, taxAmount: 90000, amount: 590000 },
        ],
      },
    },
  });

  await prisma.quotation.upsert({
    where: { number: "QT-1698763200-0002" },
    update: {},
    create: {
      number: "QT-1698763200-0002",
      customerId: customer2.id,
      planId: planEnterprise.id,
      createdById: staff.id,
      status: "sent",
      validUntil: new Date("2026-11-30"),
      subtotal: 1200000,
      taxTotal: 216000,
      discountTotal: 50000,
      total: 1366000,
      lines: {
        create: [
          { productId: productCRM.id, quantity: 1, unitPrice: 500000, taxAmount: 90000, amount: 590000 },
          { productId: productSupport.id, quantity: 1, unitPrice: 250000, taxAmount: 45000, amount: 295000 },
          { productId: productStorage.id, quantity: 1, unitPrice: 50000, taxAmount: 9000, amount: 59000 },
          { productId: productOnboarding.id, quantity: 1, unitPrice: 400000, taxAmount: 72000, amount: 472000 },
        ],
      },
    },
  });

  console.log("✅ Quotations created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("  Admin    → admin@subscript.dev  / Admin@123");
  console.log("  Staff    → staff@subscript.dev  / Staff@123");
  console.log("  Customer → acme@subscript.dev   / Customer@123");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
