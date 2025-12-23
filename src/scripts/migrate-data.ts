import { db } from "../db";
import { projects, projectUnits, galleryItems, siteSettings } from "../db/schema";
import { eq } from "drizzle-orm";

// Sample Data from ProjectContext (converted to script)
const SAMPLE_PROJECTS = [
    {
        title: "Uhud Hafeez Palace",
        location: "Enayetganj, Hazaribagh, Dhaka",
        price: "Contact for Pricing",
        description: "Modern Living at Uhud Hafeez Palace – Hazaribagh\n\nDiscover comfort and convenience at Uhud Hafeez Palace...",
        status: "Ongoing",
        imageUrl: "/images/uhud-hafeez.png",
        logoUrl: "",
        buildingAmenities: ["Lift (Modern Elevator)", "Power Backup (Full Generator)", "Integrated PBX System"],
        order: 1,
        units: [
            { name: "Type A", size: "700 Sq. Ft. (approx.)", bedrooms: 2, bathrooms: 2, balconies: 2, features: ["Drawing & Dining"], floorPlanImage: "" },
            { name: "Type B", size: "700 Sq. Ft. (approx.)", bedrooms: 2, bathrooms: 2, balconies: 2, features: ["Drawing & Dining"], floorPlanImage: "" }
        ]
    },
    {
        title: "Mayer Badhon",
        location: "Mohammadpur, Dhaka",
        price: "Starts from 95 Lac",
        description: "Mayer Badhon is designed to provide a sense of belonging and community...",
        status: "Ongoing",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000",
        logoUrl: "",
        buildingAmenities: ["Community Hall", "Rooftop Garden", "24/7 Security"],
        order: 2,
        units: [
            { name: "Standard Unit", size: "1250 Sq. Ft.", bedrooms: 3, bathrooms: 3, balconies: 2, features: ["South Facing", "Utility Room"] }
        ]
    },
    {
        title: "Sorkar Garden",
        location: "Uttara, Dhaka",
        price: "Starts from 1.5 Cr",
        description: "Experience the tranquility of nature at Sorkar Garden...",
        status: "Completed",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
        logoUrl: "",
        buildingAmenities: ["Swimming Pool", "Gymnasium", "Kids Play Zone", "Jogging Track"],
        order: 3,
        units: [
            { name: "Luxury Apartment", size: "2400 Sq. Ft.", bedrooms: 4, bathrooms: 4, balconies: 4, features: ["Lake View", "Servant Room", "Double Glazed Windows"] }
        ]
    },
    {
        title: "Uhud Tower",
        location: "Gulshan, Dhaka",
        price: "Starts from 3.5 Cr",
        description: "Uhud Tower stands as a symbol of prestige in Gulshan...",
        status: "Upcoming",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
        logoUrl: "",
        buildingAmenities: ["Concierge Service", "Helipad", "Infinity Pool", "Business Center"],
        order: 4,
        units: [
            { name: "Penthouse Suite", size: "4500 Sq. Ft.", bedrooms: 5, bathrooms: 6, balconies: 4, features: ["Private Pool", "Panaromic View", "Smart Home System"] }
        ]
    }
];

const SAMPLE_GALLERY = [
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c", caption: "Modern Interiors" },
    { url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea", caption: "Spacious Living Rooms" },
    { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0", caption: "Gourmet Kitchens" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", caption: "Backyard Oasis" }
];

async function migrate() {
    console.log("Starting migration...");

    // Check if data exists
    const existingProjects = await db.select().from(projects);
    if (existingProjects.length > 0) {
        console.log("Data already exists. Skipping migration.");
        // return; // Uncomment to prevent duplicates if running multiple times
    }

    // Projects & Units
    console.log("Migrating Projects...");
    for (const p of SAMPLE_PROJECTS) {
        const [proj] = await db.insert(projects).values({
            title: p.title,
            location: p.location,
            price: p.price,
            description: p.description,
            status: p.status,
            imageUrl: p.imageUrl,
            logoUrl: p.logoUrl,
            buildingAmenities: p.buildingAmenities,
            order: p.order
        }).returning();

        if (p.units) {
            for (const u of p.units) {
                await db.insert(projectUnits).values({
                    projectId: proj.id,
                    name: u.name,
                    size: u.size,
                    bedrooms: u.bedrooms,
                    bathrooms: u.bathrooms,
                    balconies: u.balconies,
                    features: u.features,
                    floorPlanImage: u.floorPlanImage || ""
                });
            }
        }
    }

    // Gallery
    console.log("Migrating Gallery...");
    for (const g of SAMPLE_GALLERY) {
        await db.insert(galleryItems).values({
            url: g.url,
            caption: g.caption
        });
    }

    console.log("Migration Complete!");
}

migrate()
    .then(() => process.exit(0))
    .catch(console.error);
