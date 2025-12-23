import { auth } from "../auth";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
    const email = "admin@uhudbuilders.com";
    // Setting a default secure password
    const password = "UhudBuilders@2025";
    const name = "Uhud Admin";

    console.log(`Creating admin ${email}...`);

    const [existingUser] = await db.select().from(user).where(eq(user.email, email));

    if (existingUser) {
        console.log("User already exists.");
        return;
    }

    await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        }
    });

    console.log("Secondary Admin created successfully.");
}

createAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
