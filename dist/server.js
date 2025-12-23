var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/server.ts
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// src/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  account: () => account,
  galleryItems: () => galleryItems,
  messages: () => messages,
  projectUnits: () => projectUnits,
  projects: () => projects,
  session: () => session,
  siteSettings: () => siteSettings,
  user: () => user,
  verification: () => verification
});
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { integer, jsonb } from "drizzle-orm/pg-core";
var user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});
var session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id)
});
var account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});
var verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});
var projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  price: text("price"),
  description: text("description").notNull(),
  status: text("status").notNull(),
  // 'Ongoing' | 'Completed' | 'Upcoming'
  imageUrl: text("imageUrl").notNull(),
  logoUrl: text("logoUrl"),
  buildingAmenities: jsonb("buildingAmenities").$type(),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var projectUnits = pgTable("project_units", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("projectId").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  balconies: integer("balconies").notNull(),
  features: jsonb("features").$type(),
  floorPlanImage: text("floorPlanImage")
});
var galleryItems = pgTable("gallery_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  caption: text("caption"),
  category: text("category"),
  createdAt: timestamp("createdAt").defaultNow()
});
var messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  date: timestamp("date").defaultNow(),
  read: boolean("read").default(false)
});
var siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  // Always 1
  settings: jsonb("settings").notNull(),
  // Store full JSON object for flexibility
  updatedAt: timestamp("updatedAt").defaultNow()
});

// src/db/index.ts
import * as dotenv from "dotenv";
dotenv.config();
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// src/auth.ts
var auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
    // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  trustedOrigins: ["http://localhost:5173", "http://localhost:3001"],
  advanced: {
    crossSubDomainCookies: {
      enabled: true
    }
  }
});

// src/server.ts
import { toNodeHandler } from "better-auth/node";
import { eq, desc, asc } from "drizzle-orm";
import * as dotenv2 from "dotenv";
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3001;
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001"],
  // Allow frontend dev server and self
  credentials: true
}));
var uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use(express.json());
app.use("/api/auth", toNodeHandler(auth));
app.get("/api/projects", async (req, res) => {
  try {
    const result = await db.query.projects.findMany({
      orderBy: [asc(projects.order)],
      with: {
        // We'll need to fetch units manually or use relations if defined
        // For now, let's fetch units separately to be safe or define relation
      }
    });
    const projectsWithUnits = await Promise.all(result.map(async (p) => {
      const units = await db.select().from(projectUnits).where(eq(projectUnits.projectId, p.id));
      return { ...p, units };
    }));
    res.json(projectsWithUnits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});
app.post("/api/projects", async (req, res) => {
  try {
    const { units, ...projectData } = req.body;
    const [lastProject] = await db.select({ order: projects.order }).from(projects).orderBy(desc(projects.order)).limit(1);
    const newOrder = (lastProject?.order || 0) + 1;
    const [newProject] = await db.insert(projects).values({
      ...projectData,
      order: newOrder
    }).returning();
    if (units && units.length > 0) {
      for (const u of units) {
        await db.insert(projectUnits).values({ ...u, projectId: newProject.id });
      }
    }
    res.json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});
app.get("/api/gallery", async (req, res) => {
  try {
    const items = await db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});
app.post("/api/gallery", async (req, res) => {
  try {
    const [item] = await db.insert(galleryItems).values(req.body).returning();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to add gallery item" });
  }
});
app.get("/api/messages", async (req, res) => {
  try {
    const msgs = await db.select().from(messages).orderBy(desc(messages.date));
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
app.post("/api/messages", async (req, res) => {
  try {
    const [msg] = await db.insert(messages).values(req.body).returning();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});
app.get("/api/settings", async (req, res) => {
  try {
    const [result] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    res.json(result?.settings || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});
app.post("/api/settings", async (req, res) => {
  try {
    const [result] = await db.insert(siteSettings).values({
      id: 1,
      settings: req.body
    }).onConflictDoUpdate({
      target: siteSettings.id,
      set: { settings: req.body, updatedAt: /* @__PURE__ */ new Date() }
    }).returning();
    res.json(result.settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});
app.use("/uploads", express.static(uploadDir));
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "file-" + uniqueSuffix + ext);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});
var distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get(/.*/, (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "API Not Found" });
  res.sendFile(path.join(distDir, "index.dev.html"));
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
