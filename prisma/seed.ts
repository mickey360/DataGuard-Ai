import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for seeding.");
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const org = await prisma.organization.create({ data: { name: "DataGuard Demo Organization" } });
  const workspace = await prisma.workspace.create({ data: { organizationId: org.id, name: "Acme Data Team" } });
  await prisma.workspaceMember.create({ data: { workspaceId: workspace.id, email: "owner@dataguard.local", name: "Demo Owner", role: "OWNER" } });
  await prisma.dataSource.create({ data: { workspaceId: workspace.id, name: "Demo file source", type: "FILE" } });
  console.log(`Seeded workspace ${workspace.id}`);
};

main().finally(() => prisma.$disconnect());
