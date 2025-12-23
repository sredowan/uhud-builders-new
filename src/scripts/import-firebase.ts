import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db as pgDb } from "../db";
import { projects, projectUnits, galleryItems, messages, siteSettings } from "../db/schema";
import { eq } from "drizzle-orm";

// 1. Initialize Firebase (Client SDK is fine for reading public-ish data if rules allow, or if we are admin)
// Since this is a server script, we might run into auth issues if rules are strict.
// But usually for "fetch all" we hope rules allow read.
const firebaseConfig = {
    apiKey: "AIzaSyBP-bB5u7hXMaCroqr7Vb1CvkEtWWahWWA",
    authDomain: "uhd-first.firebaseapp.com",
    projectId: "uhd-first",
    storageBucket: "uhd-first.firebasestorage.app",
    messagingSenderId: "595908995722",
    appId: "1:595908995722:web:18f6941ea1e0dda1785b73",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function importFromFirebase() {
    console.log("Connecting to Firebase...");

    // --- Projects ---
    console.log("Fetching Projects from Firestore...");
    const projectsSnap = await getDocs(collection(firestore, "projects"));
    const firebaseProjects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    console.log(`Found ${firebaseProjects.length} projects in Firebase.`);

    for (const p of firebaseProjects) {
        console.log(`Migrating project: ${p.title}`);

        // Check if exists by title to avoid dupes from previous seed
        const existing = await pgDb.select().from(projects).where(eq(projects.title, p.title));
        if (existing.length > 0) {
            console.log(`  -> Skipped (Already exists: ${p.title})`);
            continue;
        }

        const [newProj] = await pgDb.insert(projects).values({
            title: p.title,
            location: p.location || "",
            price: p.price || null,
            description: p.description || "",
            status: p.status || "Upcoming",
            imageUrl: p.imageUrl || "",
            logoUrl: p.logoUrl || null,
            buildingAmenities: p.buildingAmenities || [],
            order: p.order || 0
        }).returning();

        if (p.units && Array.isArray(p.units)) {
            for (const u of p.units) {
                await pgDb.insert(projectUnits).values({
                    projectId: newProj.id,
                    name: u.name || "Unit",
                    size: u.size || "",
                    bedrooms: Number(u.bedrooms) || 0,
                    bathrooms: Number(u.bathrooms) || 0,
                    balconies: Number(u.balconies) || 0,
                    features: u.features || [],
                    floorPlanImage: u.floorPlanImage || ""
                });
            }
        }
    }

    // --- Gallery ---
    console.log("Fetching Gallery from Firestore...");
    const gallerySnap = await getDocs(collection(firestore, "gallery"));
    const firebaseGallery = gallerySnap.docs.map(doc => doc.data()) as any[];

    console.log(`Found ${firebaseGallery.length} gallery items.`);

    for (const g of firebaseGallery) {
        // Simple dupe check by URL
        const existing = await pgDb.select().from(galleryItems).where(eq(galleryItems.url, g.url));
        if (existing.length > 0) continue;

        await pgDb.insert(galleryItems).values({
            url: g.url,
            caption: g.caption || "",
            category: g.category || "General"
        });
    }

    // --- Messages ---
    console.log("Fetching Messages from Firestore...");
    const msgSnap = await getDocs(collection(firestore, "messages"));
    const firebaseMessages = msgSnap.docs.map(doc => doc.data()) as any[];

    console.log(`Found ${firebaseMessages.length} messages.`);

    for (const m of firebaseMessages) {
        // Check dupe by email + message + date? Or just strict insert?
        // Let's assume if email + date matches, it's same.
        // Date might be string in firebase, timestamp in postgres.
        // For simplicity, we'll skipping duping logic for messages or just run it.
        // Better: Skip if email && message content matches approx.

        await pgDb.insert(messages).values({
            name: m.name || "Anonymous",
            email: m.email || "",
            phone: m.phone || "",
            message: m.message || "",
            date: m.date ? new Date(m.date) : new Date(),
            read: m.read || false
        });
    }

    // --- Settings ---
    console.log("Fetching Settings (Global) from Firestore...");
    // Note: getDoc is for single doc, getDocs for collection. 
    // We can use getDocs('settings') and find ID 'global' or just try to grab it if we knew how to using client SDK comfortably in this loop.
    // Let's grab all docs in settings to be safe.
    const settingsSnap = await getDocs(collection(firestore, "settings"));
    const globalSettings = settingsSnap.docs.find(d => d.id === 'global')?.data();

    if (globalSettings) {
        console.log("Found Global Settings within Firebase.");

        // Upsert into ID 1
        await pgDb.insert(siteSettings).values({
            id: 1,
            settings: globalSettings
        }).onConflictDoUpdate({
            target: siteSettings.id,
            set: { settings: globalSettings, updatedAt: new Date() }
        });
        console.log("Settings migrated successfully.");
    } else {
        console.log("No 'global' settings document found in Firebase.");
    }

    console.log("Firebase Import Complete!");
}

importFromFirebase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error("Error importing:", err);
        process.exit(1);
    });
