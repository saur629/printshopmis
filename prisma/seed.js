/**
 * PrintFlow MIS - Database Seed Script
 * Run: node prisma/seed.js
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function hashPassword(plain) {
  try {
    const b = require("bcryptjs");
    return await b.hash(plain, 10);
  } catch {
    try {
      const b = require("bcrypt");
      return await b.hash(plain, 10);
    } catch {
      // Pre-computed bcrypt hashes as last resort (all map to same hash for demo)
      const hashes = {
        admin123:
          "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        priya123:
          "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        ramesh123:
          "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        suresh123:
          "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        viewer123:
          "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      };
      return hashes[plain] || hashes["admin123"];
    }
  }
}

async function main() {
  console.log("\n Seeding PrintFlow MIS database...\n");

  // USERS
  console.log("Creating users...");
  const superAdmin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: await hashPassword("admin123") },
    create: {
      name: "Rajesh Kumar",
      username: "admin",
      password: await hashPassword("admin123"),
      role: "SUPER_ADMIN",
      mobile: "9876500000",
      active: true,
    },
  });
  await prisma.user.upsert({
    where: { username: "priya" },
    update: {},
    create: {
      name: "Priya Sharma",
      username: "priya",
      password: await hashPassword("priya123"),
      role: "ADMIN",
      mobile: "9876500001",
      active: true,
    },
  });
  const operator = await prisma.user.upsert({
    where: { username: "ramesh" },
    update: {},
    create: {
      name: "Ramesh Kumar",
      username: "ramesh",
      password: await hashPassword("ramesh123"),
      role: "OPERATOR",
      mobile: "9876500002",
      active: true,
    },
  });
  await prisma.user.upsert({
    where: { username: "suresh" },
    update: {},
    create: {
      name: "Suresh Singh",
      username: "suresh",
      password: await hashPassword("suresh123"),
      role: "OPERATOR",
      mobile: "9876500003",
      active: true,
    },
  });
  await prisma.user.upsert({
    where: { username: "viewer" },
    update: {},
    create: {
      name: "Anita Gupta",
      username: "viewer",
      password: await hashPassword("viewer123"),
      role: "USER",
      mobile: "9876500004",
      active: true,
    },
  });
  console.log("  OK - 5 users (admin/priya/ramesh/suresh/viewer)");

  // CLIENTS
  console.log("Creating clients...");
  const c1 = await prisma.client.upsert({
    where: { code: "CLT001" },
    update: {},
    create: {
      code: "CLT001",
      name: "ABC Corp",
      contact: "9876500010",
      email: "abc@corp.com",
      city: "Lucknow",
      gstNo: "09ABCDE1234F1Z5",
      creditLimit: 50000,
    },
  });
  const c2 = await prisma.client.upsert({
    where: { code: "CLT002" },
    update: {},
    create: {
      code: "CLT002",
      name: "City Hospital",
      contact: "9876500011",
      email: "city@hospital.com",
      city: "Lucknow",
      gstNo: "09FGHIJ5678G2Z8",
      creditLimit: 80000,
    },
  });
  const c3 = await prisma.client.upsert({
    where: { code: "CLT003" },
    update: {},
    create: {
      code: "CLT003",
      name: "Daily Star",
      contact: "9876500012",
      email: "daily@star.com",
      city: "Lucknow",
      creditLimit: 150000,
    },
  });
  const c4 = await prisma.client.upsert({
    where: { code: "CLT004" },
    update: {},
    create: {
      code: "CLT004",
      name: "Sharma Traders",
      contact: "9876500013",
      city: "Lucknow",
      creditLimit: 30000,
    },
  });
  const c5 = await prisma.client.upsert({
    where: { code: "CLT005" },
    update: {},
    create: {
      code: "CLT005",
      name: "PQR Events",
      contact: "9876500014",
      city: "Kanpur",
      creditLimit: 40000,
    },
  });
  console.log("  OK - 5 clients");

  // SUPPLIERS
  console.log("Creating suppliers...");
  const s1 = await prisma.supplier.upsert({
    where: { code: "SUP001" },
    update: {},
    create: {
      code: "SUP001",
      name: "Star Papers Pvt Ltd",
      contact: "9876600001",
      gstNo: "09STAR1234S1Z2",
      items: "Paper, Boards",
    },
  });
  const s2 = await prisma.supplier.upsert({
    where: { code: "SUP002" },
    update: {},
    create: {
      code: "SUP002",
      name: "Ink World",
      contact: "9876600002",
      gstNo: "09INKW5678I2Z5",
      items: "CMYK Inks",
    },
  });
  await prisma.supplier.upsert({
    where: { code: "SUP003" },
    update: {},
    create: {
      code: "SUP003",
      name: "Flex Suppliers",
      contact: "9876600003",
      gstNo: "09FLEX9012F3Z8",
      items: "Flex, Vinyl",
    },
  });
  console.log("  OK - 3 suppliers");

  // JOB TYPES
  console.log("Creating job types...");
  const jt1 = await prisma.jobType.upsert({
    where: { code: "JT01" },
    update: {},
    create: {
      code: "JT01",
      name: "Offset Printing",
      baseRate: 8.5,
      gstPct: 18,
      tatDays: 3,
    },
  });
  const jt2 = await prisma.jobType.upsert({
    where: { code: "JT02" },
    update: {},
    create: {
      code: "JT02",
      name: "Digital Printing",
      baseRate: 12,
      gstPct: 18,
      tatDays: 1,
    },
  });
  await prisma.jobType.upsert({
    where: { code: "JT03" },
    update: {},
    create: {
      code: "JT03",
      name: "Flex Banner",
      baseRate: 85,
      gstPct: 18,
      tatDays: 1,
    },
  });
  await prisma.jobType.upsert({
    where: { code: "JT04" },
    update: {},
    create: {
      code: "JT04",
      name: "Packaging",
      baseRate: 0,
      gstPct: 12,
      tatDays: 5,
    },
  });
  await prisma.jobType.upsert({
    where: { code: "JT05" },
    update: {},
    create: {
      code: "JT05",
      name: "Screen Printing",
      baseRate: 5,
      gstPct: 18,
      tatDays: 2,
    },
  });
  console.log("  OK - 5 job types");

  // ITEMS
  console.log("Creating inventory items...");
  const existingItems = await prisma.item.count();
  if (existingItems === 0) {
    await prisma.item.createMany({
      data: [
        {
          hsnCode: "48025590",
          name: "Maplitho Paper A4 70 GSM",
          unit: "KG",
          gstPct: 18,
          saleRate: 62,
          stock: 480,
          minStock: 100,
        },
        {
          hsnCode: "32081010",
          name: "Offset Ink CMYK Set",
          unit: "KG",
          gstPct: 18,
          saleRate: 850,
          stock: 4,
          minStock: 10,
        },
        {
          hsnCode: "39206990",
          name: "PVC Flex Roll 13oz",
          unit: "ROLL",
          gstPct: 18,
          saleRate: 1800,
          stock: 8,
          minStock: 3,
        },
        {
          hsnCode: "48109900",
          name: "Art Paper 130 GSM",
          unit: "KG",
          gstPct: 18,
          saleRate: 78,
          stock: 120,
          minStock: 50,
        },
        {
          hsnCode: "39201090",
          name: "Lamination Film Matt",
          unit: "ROLL",
          gstPct: 18,
          saleRate: 2200,
          stock: 3,
          minStock: 5,
        },
        {
          hsnCode: "48115900",
          name: "Coated Board 300 GSM",
          unit: "KG",
          gstPct: 18,
          saleRate: 95,
          stock: 200,
          minStock: 50,
        },
      ],
    });
    console.log("  OK - 6 items");
  } else {
    console.log("  OK - items already exist");
  }

  // JOB CARDS
  console.log("Creating sample job cards...");
  const jobsExist = await prisma.jobCard.count();
  if (jobsExist === 0) {
    await prisma.jobCard.createMany({
      data: [
        {
          jobNo: "JC-2025-0124",
          clientId: c1.id,
          jobTypeId: jt1.id,
          description: "Letterhead A4, 2-color offset",
          qty: 5000,
          size: "A4",
          colors: "2-color",
          paper: "Maplitho 70 GSM",
          operatorId: operator.id,
          status: "IN_PRESS",
          dueDate: new Date("2025-04-05"),
          rate: 8.5,
          amount: 42500,
          gstPct: 18,
          gstAmount: 7650,
          totalAmount: 50150,
        },
        {
          jobNo: "JC-2025-0123",
          clientId: c4.id,
          jobTypeId: jt2.id,
          description: "Business Cards, Full Color",
          qty: 500,
          size: "3.5x2 inch",
          colors: "4-color (CMYK)",
          status: "PRE_PRESS",
          dueDate: new Date("2025-04-02"),
          rate: 12,
          amount: 6000,
          gstPct: 18,
          gstAmount: 1080,
          totalAmount: 7080,
        },
        {
          jobNo: "JC-2025-0122",
          clientId: c2.id,
          jobTypeId: jt1.id,
          description: "Brochure Tri-fold, 4-color, Matt Lam",
          qty: 2000,
          size: "A4",
          colors: "4-color (CMYK)",
          paper: "Art Paper 130 GSM",
          status: "CUTTING",
          dueDate: new Date("2025-04-07"),
          rate: 11,
          amount: 22000,
          gstPct: 18,
          gstAmount: 3960,
          totalAmount: 25960,
        },
        {
          jobNo: "JC-2025-0121",
          clientId: c5.id,
          jobTypeId: jt1.id,
          description: "Flex Banner 10x4 ft",
          qty: 15,
          size: "10x4 ft",
          colors: "4-color (CMYK)",
          status: "READY",
          dueDate: new Date("2025-04-01"),
          rate: 85,
          amount: 12750,
          gstPct: 18,
          gstAmount: 2295,
          totalAmount: 15045,
        },
        {
          jobNo: "JC-2025-0120",
          clientId: c3.id,
          jobTypeId: jt1.id,
          description: "Newspaper Insert 4-page tabloid",
          qty: 50000,
          size: "Tabloid",
          colors: "4-color (CMYK)",
          operatorId: operator.id,
          status: "QUALITY_CHECK",
          dueDate: new Date("2025-04-03"),
          rate: 1.2,
          amount: 60000,
          gstPct: 18,
          gstAmount: 10800,
          totalAmount: 70800,
        },
      ],
    });
    console.log("  OK - 5 job cards");
  } else {
    console.log("  OK - job cards already exist");
  }

  // INVOICES + PAYMENTS
  console.log("Creating invoices...");
  const invExist = await prisma.invoice.count();
  if (invExist === 0) {
    const inv1 = await prisma.invoice.create({
      data: {
        invNo: "INV-0258",
        clientId: c1.id,
        dueDate: new Date("2025-04-15"),
        subTotal: 42500,
        gstAmount: 7650,
        totalAmount: 50150,
        paidAmount: 50150,
        status: "PAID",
        items: {
          create: [
            {
              description: "Letterhead A4, 2-color offset",
              qty: 5000,
              rate: 8.5,
              amount: 42500,
              gstPct: 18,
              gstAmount: 7650,
              totalAmount: 50150,
            },
          ],
        },
      },
    });
    await prisma.invoice.create({
      data: {
        invNo: "INV-0257",
        clientId: c2.id,
        dueDate: new Date("2025-04-14"),
        subTotal: 22000,
        gstAmount: 3960,
        totalAmount: 25960,
        paidAmount: 0,
        status: "UNPAID",
        items: {
          create: [
            {
              description: "Brochure Tri-fold, 4-color",
              qty: 2000,
              rate: 11,
              amount: 22000,
              gstPct: 18,
              gstAmount: 3960,
              totalAmount: 25960,
            },
          ],
        },
      },
    });
    await prisma.invoice.create({
      data: {
        invNo: "INV-0256",
        clientId: c3.id,
        dueDate: new Date("2025-03-20"),
        subTotal: 60000,
        gstAmount: 10800,
        totalAmount: 70800,
        paidAmount: 0,
        status: "OVERDUE",
        items: {
          create: [
            {
              description: "Newspaper Insert 4-page",
              qty: 50000,
              rate: 1.2,
              amount: 60000,
              gstPct: 18,
              gstAmount: 10800,
              totalAmount: 70800,
            },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: {
        receiptNo: "REC-0445",
        clientId: c1.id,
        invoiceId: inv1.id,
        amount: 50150,
        mode: "UPI",
        reference: "UPI-TXN9821",
        status: "SETTLED",
      },
    });
    console.log("  OK - 3 invoices + 1 payment");
  } else {
    console.log("  OK - invoices already exist");
  }

  // SMS TEMPLATES
  console.log("Creating SMS templates...");
  const tplExist = await prisma.smsTemplate.count();
  if (tplExist === 0) {
    await prisma.smsTemplate.createMany({
      data: [
        {
          name: "Job Ready for Pickup",
          content:
            "Dear {client_name}, your print job {job_id} is ready for pickup. Contact: {shop_phone}. - {shop_name}",
          isAuto: true,
          trigger: "READY",
        },
        {
          name: "Payment Reminder",
          content:
            "Dear {client_name}, invoice {inv_no} of Rs.{amount} is due on {due_date}. Kindly make payment. {shop_name}",
          isAuto: false,
        },
        {
          name: "Job In Press",
          content:
            "Dear {client_name}, your job {job_id} has entered production. Expected delivery: {due_date}. {shop_name}",
          isAuto: true,
          trigger: "IN_PRESS",
        },
        {
          name: "Order Confirmation",
          content:
            "Dear {client_name}, we received your order {job_id}. Our team will begin work shortly. {shop_name}",
          isAuto: true,
          trigger: "RECEIVED",
        },
      ],
    });
    console.log("  OK - 4 SMS templates");
  }

  // TODAY ATTENDANCE
  console.log("Marking today attendance...");
  const allUsers = await prisma.user.findMany({ take: 5 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const u of allUsers) {
    await prisma.attendance.upsert({
      where: { userId_date: { userId: u.id, date: today } },
      update: {},
      create: {
        userId: u.id,
        date: today,
        checkIn: "09:00",
        status: "PRESENT",
      },
    });
  }
  console.log("  OK - attendance marked");

  console.log("\n========================================");
  console.log("  SEED COMPLETE! Login credentials:");
  console.log("  Super Admin : admin   / admin123");
  console.log("  Admin       : priya   / priya123");
  console.log("  Operator    : ramesh  / ramesh123");
  console.log("  View Only   : viewer  / viewer123");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
