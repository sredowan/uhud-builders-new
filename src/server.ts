import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';
import { db } from './db';
import { projects, projectUnits, galleryItems, messages, siteSettings } from './db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3001",
        "https://uhudbuilders.com",
        "http://uhudbuilders.com"
    ],
    credentials: true
}));

// Ensure uploads directory exists
// Use process.cwd() for bundled server compatibility
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// JSON middleware
app.use(express.json());

// --- Better Auth Handler ---
app.use("/api/auth", toNodeHandler(auth));

// --- API Routes ---

// 1. Projects
app.get('/api/projects', async (req, res) => {
    try {
        const result = await db.query.projects.findMany({
            orderBy: [asc(projects.order)],
            with: {
                // We'll need to fetch units manually or use relations if defined
                // For now, let's fetch units separately to be safe or define relation
            }
        });

        // Manual unit fetching for now to ensure shape matches frontend
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

app.post('/api/projects', async (req, res) => {
    // Ideally adding auth check here: await auth.api.getSession({ headers: req.headers })
    try {
        const { units, ...projectData } = req.body;
        // Get max order
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

// 2. Gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const items = await db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
        res.json(items);
    } catch (err) { res.status(500).json({ error: "Failed to fetch gallery" }); }
});

app.post('/api/gallery', async (req, res) => {
    try {
        const [item] = await db.insert(galleryItems).values(req.body).returning();
        res.json(item);
    } catch (err) { res.status(500).json({ error: "Failed to add gallery item" }); }
});

// 3. Messages
app.get('/api/messages', async (req, res) => {
    try {
        const msgs = await db.select().from(messages).orderBy(desc(messages.date));
        res.json(msgs);
    } catch (err) { res.status(500).json({ error: "Failed to fetch messages" }); }
});

app.post('/api/messages', async (req, res) => {
    try {
        const [msg] = await db.insert(messages).values(req.body).returning();
        res.json(msg);
    } catch (err) { res.status(500).json({ error: "Failed to send message" }); }
});

// 4. Settings
app.get('/api/settings', async (req, res) => {
    try {
        const [result] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
        res.json(result?.settings || {}); // Return empty obj if not found
    } catch (err) { res.status(500).json({ error: "Failed to fetch settings" }); }
});

app.post('/api/settings', async (req, res) => {
    try {
        // Upsert
        const [result] = await db.insert(siteSettings).values({
            id: 1,
            settings: req.body
        }).onConflictDoUpdate({
            target: siteSettings.id,
            set: { settings: req.body, updatedAt: new Date() }
        }).returning();
        res.json(result.settings);
    } catch (err) { res.status(500).json({ error: "Failed to save settings" }); }
});

// 5. File Upload (Multer)
// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, url: fileUrl, filename: req.file.filename });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});


// Serve static files from 'dist' directory (Vite build) - Production only
// Use process.cwd() for bundled server compatibility
const distDir = path.join(process.cwd(), 'dist');
app.use(express.static(distDir));

// Catch-all handler
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API Not Found' });
    res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
