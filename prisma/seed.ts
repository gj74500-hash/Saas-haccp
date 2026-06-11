import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo1234!", 12);

  const company = await prisma.company.upsert({
    where: { slug: "demo-bistro" },
    update: {},
    create: {
      name: "Demo Bistro",
      slug: "demo-bistro",
      address: "12 Market Street, London",
      phone: "+44 20 1234 5678",
      subscription: {
        create: {
          plan: "TRIAL",
          status: "TRIALING",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const location = await prisma.location.upsert({
    where: { id: "seed-location-main" },
    update: {},
    create: {
      id: "seed-location-main",
      companyId: company.id,
      name: "Main Kitchen",
      address: "12 Market Street, London",
      timezone: "Europe/London",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.haccppro.app" },
    update: {},
    create: {
      companyId: company.id,
      email: "owner@demo.haccppro.app",
      passwordHash,
      firstName: "Olivia",
      lastName: "Owner",
      role: "OWNER",
      locations: { create: { locationId: location.id } },
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.haccppro.app" },
    update: {},
    create: {
      companyId: company.id,
      email: "manager@demo.haccppro.app",
      passwordHash,
      firstName: "Marc",
      lastName: "Manager",
      role: "MANAGER",
      locations: { create: { locationId: location.id } },
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@demo.haccppro.app" },
    update: {},
    create: {
      companyId: company.id,
      email: "employee@demo.haccppro.app",
      passwordHash,
      firstName: "Emma",
      lastName: "Employee",
      role: "EMPLOYEE",
      locations: { create: { locationId: location.id } },
    },
  });

  // Equipment with compliant ranges (°C)
  const fridge = await prisma.equipment.upsert({
    where: { id: "seed-eq-fridge-1" },
    update: {},
    create: {
      id: "seed-eq-fridge-1",
      locationId: location.id,
      name: "Walk-in Fridge",
      type: "FRIDGE",
      minTemp: 0,
      maxTemp: 5,
    },
  });

  const freezer = await prisma.equipment.upsert({
    where: { id: "seed-eq-freezer-1" },
    update: {},
    create: {
      id: "seed-eq-freezer-1",
      locationId: location.id,
      name: "Chest Freezer",
      type: "FREEZER",
      minTemp: -25,
      maxTemp: -18,
    },
  });

  // Wipe demo activity so re-seeding stays deterministic
  await prisma.temperatureLog.deleteMany({ where: { companyId: company.id } });
  await prisma.alert.deleteMany({ where: { companyId: company.id } });
  await prisma.cleaningTask.deleteMany({ where: { companyId: company.id } });

  const now = Date.now();
  const hours = (n: number) => new Date(now - n * 60 * 60 * 1000);

  // A week of fridge/freezer readings, two of them out of range
  const logs: {
    equipmentId: string;
    type: "FRIDGE" | "FREEZER";
    value: number;
    hoursAgo: number;
    recordedById: string;
  }[] = [];
  for (let day = 6; day >= 0; day--) {
    for (const slot of [9, 17]) {
      const hoursAgo = day * 24 + (24 - slot);
      logs.push({
        equipmentId: fridge.id,
        type: "FRIDGE",
        value: Math.round((2 + Math.sin(day + slot) * 1.5) * 10) / 10,
        hoursAgo,
        recordedById: day % 2 === 0 ? employee.id : manager.id,
      });
      logs.push({
        equipmentId: freezer.id,
        type: "FREEZER",
        value: Math.round((-20 + Math.cos(day + slot) * 1.5) * 10) / 10,
        hoursAgo,
        recordedById: day % 2 === 0 ? manager.id : employee.id,
      });
    }
  }
  // Out-of-range readings (trigger alerts below)
  logs.push({ equipmentId: fridge.id, type: "FRIDGE", value: 8.4, hoursAgo: 5, recordedById: employee.id });
  logs.push({ equipmentId: freezer.id, type: "FREEZER", value: -12.1, hoursAgo: 30, recordedById: employee.id });

  for (const log of logs) {
    const eq = log.equipmentId === fridge.id ? fridge : freezer;
    await prisma.temperatureLog.create({
      data: {
        companyId: company.id,
        locationId: location.id,
        equipmentId: log.equipmentId,
        type: log.type,
        value: log.value,
        isCompliant: log.value >= eq.minTemp && log.value <= eq.maxTemp,
        recordedById: log.recordedById,
        recordedAt: hours(log.hoursAgo),
      },
    });
  }

  await prisma.alert.create({
    data: {
      companyId: company.id,
      locationId: location.id,
      type: "TEMP_OUT_OF_RANGE",
      severity: "CRITICAL",
      title: "Walk-in Fridge above range",
      message: "Walk-in Fridge recorded 8.4°C (compliant range 0–5°C). Check door seal and move stock if needed.",
      status: "ACTIVE",
      createdAt: hours(5),
    },
  });
  await prisma.alert.create({
    data: {
      companyId: company.id,
      locationId: location.id,
      type: "TEMP_OUT_OF_RANGE",
      severity: "WARNING",
      title: "Chest Freezer above range",
      message: "Chest Freezer recorded -12.1°C (compliant range -25 to -18°C).",
      status: "ACKNOWLEDGED",
      acknowledgedById: manager.id,
      createdAt: hours(30),
    },
  });
  await prisma.alert.create({
    data: {
      companyId: company.id,
      locationId: location.id,
      type: "MISSED_CLEANING",
      severity: "WARNING",
      title: "Missed cleaning task",
      message: "\"Deep clean fryer\" was not completed yesterday.",
      status: "ACTIVE",
      createdAt: hours(20),
    },
  });

  // Cleaning tasks with a mix of completed / pending occurrences
  const tasks = [
    { name: "Sanitize prep surfaces", area: "Kitchen", frequency: "DAILY" as const, assignedToId: employee.id },
    { name: "Clean walk-in fridge shelves", area: "Cold room", frequency: "WEEKLY" as const, assignedToId: employee.id },
    { name: "Deep clean fryer", area: "Kitchen", frequency: "WEEKLY" as const, assignedToId: manager.id },
    { name: "Mop dining area floor", area: "Dining area", frequency: "DAILY" as const, assignedToId: employee.id },
  ];
  for (const [i, t] of tasks.entries()) {
    await prisma.cleaningTask.create({
      data: {
        companyId: company.id,
        locationId: location.id,
        name: t.name,
        area: t.area,
        frequency: t.frequency,
        assignedToId: t.assignedToId,
        completions:
          i === 0
            ? {
                create: {
                  dueDate: hours(26),
                  completedAt: hours(25),
                  completedById: employee.id,
                  status: "COMPLETED",
                },
              }
            : i === 2
              ? { create: { dueDate: hours(20), status: "MISSED" } }
              : undefined,
      },
    });
  }

  await prisma.auditLog.createMany({
    data: [
      { companyId: company.id, userId: owner.id, action: "company.create", entityType: "Company", entityId: company.id, createdAt: hours(168) },
      { companyId: company.id, userId: employee.id, action: "temperature.create", entityType: "TemperatureLog", createdAt: hours(5) },
      { companyId: company.id, userId: manager.id, action: "alert.acknowledge", entityType: "Alert", createdAt: hours(28) },
      { companyId: company.id, userId: employee.id, action: "cleaning_task.complete", entityType: "CleaningTask", createdAt: hours(25) },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo logins (password: Demo1234!):");
  console.log("  owner@demo.haccppro.app / manager@demo.haccppro.app / employee@demo.haccppro.app");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
