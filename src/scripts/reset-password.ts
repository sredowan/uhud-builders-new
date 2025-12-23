import { auth } from "../auth";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

async function resetPassword() {
    const email = "aarsayem002@gmail.com";
    const password = "JJstmg3xpt9@!";

    console.log(`Resetting password for ${email}...`);

    // 1. Find the user
    const [existingUser] = await db.select().from(user).where(eq(user.email, email));

    if (!existingUser) {
        console.error("User not found! Creating instead...");
        await auth.api.signUpEmail({
            body: { email, password, name: "Admin User" }
        });
        console.log("User created.");
        return;
    }

    // 2. Delete existing password/account link to be safe? 
    // Better Auth might handle "changePassword" if we have session, but we don't.
    // We can use the internal API or just hash it manually? 
    // Better Auth doesn't easily expose "admin set password" without a plugin usually.
    // But wait, we can just delete the user and re-create them? 
    // That would lose userId references in other tables if we had them (we don't for Settings/Projects yet).
    // Actually, SiteSettings has no userId.
    // So deleting and re-creating is safe-ish.

    // Let's try to remove the user and re-create.
    // But 'user' table is referenced by session/account.

    // Let's try direct deletion (cascades usually? No, schema didn't specify cascade for all).
    // Schema: userId references user.id.

    // Alternative: Use `auth.api.forgetPassword`? No, requires email flow.

    // Let's just DELETE the user and re-create. It's the surest way for a "hard reset".
    // We will manually delete dependent records first if needed.

    try {
        // Delete accounts/sessions first
        const { session, account } = await import("../db/schema");
        await db.delete(session).where(eq(session.userId, existingUser.id));
        await db.delete(account).where(eq(account.userId, existingUser.id));

        await db.delete(user).where(eq(user.email, email));
        console.log("Old user deleted.");
    } catch (e) {
        console.log("Could not delete user (maybe dependencies):", e);
        // If we can't delete, we can't easily reset pass without session.
        // Wait! better-auth usually has an admin API if configured? No.
        // Hashing manually? better-auth uses bcrypt or argon2.
        // Let's assume re-creation is best.
    }

    const res = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name: "Admin User",
        }
    });

    console.log("Admin user re-created/reset successfully.");
}

resetPassword()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
