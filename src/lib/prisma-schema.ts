export const PRISMA_SCHEMA = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum PlanCategory {
  Career
  Health
  Finance
  Learning
  Personal
  Project
}

enum PlanStatus {
  NOT_STARTED
  IN_PROGRESS
  ON_TRACK
  BEHIND
  COMPLETED
  ON_HOLD
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  DONE
}

model User {
  id               String        @id @default(cuid())
  name             String
  email            String        @unique
  passwordHash     String
  avatar           String?
  role             String        @default("MEMBER")
  twoFactorEnabled Boolean       @default(false)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  plans            Plan[]
  activities       ActivityLog[]
  sessions         Session[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Plan {
  id             String        @id @default(cuid())
  userId         String
  title          String
  description    String        @db.Text
  category       PlanCategory
  status         PlanStatus    @default(IN_PROGRESS)
  priority       Priority      @default(MEDIUM)
  startDate      DateTime      @default(now())
  targetDate     DateTime
  estimatedHours Float         @default(0)
  actualHours    Float         @default(0)
  color          String?
  tags           String[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  milestones     Milestone[]
  tasks          Task[]

  @@index([userId, status])
  @@map("plans")
}

model Milestone {
  id          String    @id @default(cuid())
  planId      String
  title       String
  targetDate  DateTime
  completed   Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  plan        Plan      @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId])
  @@map("milestones")
}

model Task {
  id               String     @id @default(cuid())
  planId           String
  title            String
  description      String?    @db.Text
  status           TaskStatus @default(TODO)
  priority         Priority   @default(MEDIUM)
  dueDate          DateTime
  estimatedMinutes Int        @default(30)
  actualMinutes    Int?       @default(0)
  completedAt      DateTime?
  subtasksJson     Json?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  plan             Plan       @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId, status])
  @@map("tasks")
}

model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  description String
  entityTitle String?
  timestamp   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
  @@map("activity_logs")
}
`;

export const NEXTJS_API_SAMPLE = `// app/api/plans/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    where: { user: { email: session.user.email } },
    include: {
      tasks: { orderBy: { dueDate: 'asc' } },
      milestones: { orderBy: { targetDate: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const newPlan = await prisma.plan.create({
    data: {
      ...body,
      user: { connect: { email: session.user.email } },
    },
    include: { tasks: true, milestones: true },
  });

  return NextResponse.json({ plan: newPlan }, { status: 201 });
}
`;
