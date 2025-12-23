import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { auth } from '../src/auth';
import { toNodeHandler } from 'better-auth/node';
import { db } from '../src/db';
import { projects, projectUnits, galleryItems, messages, siteSettings } from '../src/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

const app = express();

// CORS Configuration for split deployment
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3001",
    "https://uhudbuilders.com",
    "http://uhudbuilders.com",
    "https://www.uhudbuilders.com"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight
app.options('*', cors());

// JSON middleware
app.use(express.json());

// --- Better Auth Handler ---
app.all("/api/auth/*", toNodeHandler(auth));

// --- API Routes ---

// 1. Projects
app.get('/api/projects', async (req, res) => {
    try {
        const result = await db.query.projects.findMany({
            orderBy: [asc(projects.order)],
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

app.post('/api/projects', async (req, res) => {
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

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { units, ...projectData } = req.body;

        const [updated] = await db.update(projects)
            .set(projectData)
            .where(eq(projects.id, id))
            .returning();

        // Delete existing units and re-insert
        await db.delete(projectUnits).where(eq(projectUnits.projectId, id));
        if (units && units.length > 0) {
            for (const u of units) {
                await db.insert(projectUnits).values({ ...u, projectId: id });
            }
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update project" });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(projectUnits).where(eq(projectUnits.projectId, id));
        await db.delete(projects).where(eq(projects.id, id));
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete project" });
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

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        await db.delete(galleryItems).where(eq(galleryItems.id, req.params.id));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Failed to delete gallery item" }); }
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

app.delete('/api/messages/:id', async (req, res) => {
    try {
        await db.delete(messages).where(eq(messages.id, req.params.id));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Failed to delete message" }); }
});

// 4. Settings
app.get('/api/settings', async (req, res) => {
    try {
        const [result] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
        res.json(result?.settings || {});
    } catch (err) { res.status(500).json({ error: "Failed to fetch settings" }); }
});

app.post('/api/settings', async (req, res) => {
    try {
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
    return app(req, res);
}
