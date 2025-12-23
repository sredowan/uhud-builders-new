import { auth } from "../../api/_lib/auth";
import { db } from "../../api/_lib/db";
import { user } from "../../api/_lib/db/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
    const email = "aarsayem002@gmail.com";
    const password = "JJstmg3xpt9@!";
    const name = "Admin User";

    console.log("Checking if admin exists...");
    const existingUser = await db.select().from(user).where(eq(user.email, email));

    if (existingUser.length > 0) {
        console.log("Admin user already exists.");
        return;
    }

    console.log("Creating admin user...");
    // Use Better Auth API to sign up (hashes password automatically)
    const res = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        }
    });

    if (res) {
        console.log("Admin user created successfully!");
    } else {
        console.error("Failed to create admin user.");
    }
}

seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
