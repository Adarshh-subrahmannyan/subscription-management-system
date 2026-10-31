import { randomUUID } from "node:crypto";
import { prisma } from "../../src/lib/prisma";
import { createQuotation } from "../../src/modules/quotations";
import { convertQuotationToSubscription } from "../../src/modules/subscriptions";

async function main() {
  const suffix = randomUUID();
  const admin = await prisma.user.create({
    data: { email: `quote-admin-${suffix}@example.com`, name: "Quote Admin", role: "admin" },
  });
  const customer = await prisma.customer.create({
    data: { email: `quote-customer-${suffix}@example.com`, name: "Quote Customer" },
  });
  const product = await prisma.product.create({
    data: { name: `Quote Product ${suffix}`, type: "service", salesPrice: 1000 },
  });
  const plan = await prisma.plan.create({
    data: {
      name: `Quote Plan ${suffix}`,
      price: 1000,
      billingFrequency: "monthly",
      allowEarlyClosure: true,
      items: { create: { productId: product.id, quantity: 1 } },
    },
  });

  try {
    const quotation = await createQuotation("admin", admin.id, {
      customerId: customer.id,
      planId: plan.id,
      validUntil: "2099-01-01T00:00:00.000Z",
      lines: [{ productId: product.id, quantity: 2 }],
    });
    if (quotation.subtotal !== 2000 || quotation.total !== 2000) {
      throw new Error("Quotation totals were calculated incorrectly.");
    }

    await prisma.quotation.update({
      where: { id: quotation.id },
      data: { status: "accepted" },
    });
    const subscription = await convertQuotationToSubscription(
      "admin",
      quotation.id,
      "2026-11-01T00:00:00.000Z",
    );
    if (subscription.customerId !== customer.id || subscription.lines[0]?.amount !== 2000) {
      throw new Error("Quotation conversion did not copy subscription data.");
    }

    const duplicate = await convertQuotationToSubscription(
      "admin",
      quotation.id,
      "2026-11-01T00:00:00.000Z",
    );
    if (duplicate.id !== subscription.id) {
      throw new Error("Quotation conversion was not idempotent.");
    }
    console.log("Quotation creation and conversion integration test passed!");
  } finally {
    await prisma.subscription.deleteMany({ where: { customerId: customer.id } });
    await prisma.quotationLine.deleteMany({ where: { quotation: { customerId: customer.id } } });
    await prisma.quotation.deleteMany({ where: { customerId: customer.id } });
    await prisma.planItem.deleteMany({ where: { planId: plan.id } });
    await prisma.plan.delete({ where: { id: plan.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.user.delete({ where: { id: admin.id } });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
