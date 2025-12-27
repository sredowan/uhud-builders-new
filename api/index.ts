import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple Vercel serverless handler - no Express to avoid overhead and compatibility issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3001",
        "https://uhudbuilders.com",
        "https://www.uhudbuilders.com",
        "https://api.uhudbuilders.com"
    ];

    const origin = req.headers.origin as string || '';
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url || '';
    const method = req.method || 'GET';

    // Debug endpoint - no dependencies
    if (url === '/api/ping' || url.startsWith('/api/ping?')) {
        return res.json({
            status: 'ok',
            message: 'API is reachable',
            timestamp: new Date().toISOString(),
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                hasAuthSecret: !!process.env.BETTER_AUTH_SECRET
            }
        });
    }

    // Health check
    if (url === '/api/health' || url.startsWith('/api/health?')) {
        return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    try {
        // Dynamic imports for database-dependent routes
        const { db } = await import('./_lib/db');
        const { projects, projectUnits, galleryItems, messages, siteSettings } = await import('./_lib/db/schema');
        const { eq, desc, asc } = await import('drizzle-orm');

        // === AUTH ROUTES ===
        if (url.startsWith('/api/auth/')) {
            const { auth } = await import('./_lib/auth');
            const { toNodeHandler } = await import('better-auth/node');
            return toNodeHandler(auth)(req as any, res as any);
        }

        // === PROJECTS API ===
        if (url === '/api/projects' || url === '/api/projects/') {
            if (method === 'GET') {
                const result = await db.query.projects.findMany({
                    orderBy: [asc(projects.order)],
                });
                const projectsWithUnits = await Promise.all(result.map(async (p: any) => {
                    const units = await db.select().from(projectUnits).where(eq(projectUnits.projectId, p.id));
                    return { ...p, units };
                }));
                return res.json(projectsWithUnits);
            }

            if (method === 'POST') {
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
                return res.json(newProject);
            }
        }

        // Project by ID (PUT/DELETE)
        const projectIdMatch = url.match(/^\/api\/projects\/([^\/\?]+)/);
        if (projectIdMatch) {
            const id = projectIdMatch[1];

            if (method === 'PUT') {
                const { units, title, location, price, description, status, imageUrl, logoUrl, buildingAmenities } = req.body;
                const [updated] = await db.update(projects)
                    .set({ title, location, price, description, status, imageUrl, logoUrl, buildingAmenities, updatedAt: new Date() })
                    .where(eq(projects.id, id))
                    .returning();
                await db.delete(projectUnits).where(eq(projectUnits.projectId, id));
                if (units && units.length > 0) {
                    for (const u of units) {
                        await db.insert(projectUnits).values({
                            projectId: id, name: u.name, size: u.size, bedrooms: u.bedrooms,
                            bathrooms: u.bathrooms, balconies: u.balconies, features: u.features || [], floorPlanImage: u.floorPlanImage || ''
                        });
                    }
                }
                return res.json(updated);
            }

            if (method === 'DELETE') {
                await db.delete(projectUnits).where(eq(projectUnits.projectId, id));
                await db.delete(projects).where(eq(projects.id, id));
                return res.json({ success: true });
            }
        }

        // === GALLERY API ===
        if (url === '/api/gallery' || url === '/api/gallery/') {
            if (method === 'GET') {
                const items = await db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
                return res.json(items);
            }
            if (method === 'POST') {
                const [item] = await db.insert(galleryItems).values(req.body).returning();
                return res.json(item);
            }
        }

        const galleryIdMatch = url.match(/^\/api\/gallery\/([^\/\?]+)/);
        if (galleryIdMatch && method === 'DELETE') {
            await db.delete(galleryItems).where(eq(galleryItems.id, galleryIdMatch[1]));
            return res.json({ success: true });
        }

        // === MESSAGES API ===
        if (url === '/api/messages' || url === '/api/messages/') {
            if (method === 'GET') {
                const msgs = await db.select().from(messages).orderBy(desc(messages.date));
                return res.json(msgs);
            }
            if (method === 'POST') {
                const [msg] = await db.insert(messages).values(req.body).returning();
                return res.json(msg);
            }
        }

        const msgIdMatch = url.match(/^\/api\/messages\/([^\/\?]+)/);
        if (msgIdMatch && method === 'DELETE') {
            await db.delete(messages).where(eq(messages.id, msgIdMatch[1]));
            return res.json({ success: true });
        }

        // === SETTINGS API ===
        if (url === '/api/settings' || url === '/api/settings/') {
            if (method === 'GET') {
                const [result] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
                return res.json(result?.settings || {});
            }
            if (method === 'POST') {
                const [result] = await db.insert(siteSettings).values({
                    id: 1,
                    settings: req.body
                }).onConflictDoUpdate({
                    target: siteSettings.id,
                    set: { settings: req.body, updatedAt: new Date() }
                }).returning();
                return res.json(result.settings);
            }
        }

        // 404 fallback
        return res.status(404).json({ error: 'API endpoint not found', url });

    } catch (err: any) {
        console.error('API Error:', err);
        return res.status(500).json({
            error: 'Internal server error',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}
