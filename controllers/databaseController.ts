
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import { account } from "../interfaces";
import axios from 'axios'

const uri = "mongodb+srv://Louis:louis2024@ap-wo.f6fxict.mongodb.net/?appName=AP-WO"
const client = new MongoClient(uri);

// Export db so it can be imported elsewhere
export const db = client.db("Rivals-Track"); 


// Add a collection for your Marvel Rivals API data
export const gameCacheCollection = db.collection("game_cache");
export const userCollection = db.collection<account>("Accounts");

function generateRandomSalt(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let salt = "";
    for (let i = 0; i < 10; i++) {
        salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
}


export async function createAccount(data: Omit<account, "salt">) {
    const salt = generateRandomSalt();
    
    const hashedPassword = await bcrypt.hash(data.password + salt, 10);

    const newAccount: account = {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        salt: salt,
        role: data.role || "USER"
    };

    return await userCollection.insertOne(newAccount);
}



export async function login(email: string, passwordAttempt: string): Promise<account | null> {
    const user = await userCollection.findOne({ email });
    
    if (!user) {
        console.log("Login failed: User not found");
        return null;
    }

    const saltedAttempt = passwordAttempt + user.salt; 
    
    const isMatch = await bcrypt.compare(saltedAttempt, user.password);

    if (!isMatch) {
        console.log("Login failed: Password mismatch for", email);
        return null;
    }

    return user;
}

export async function updateAccount(id: string, updates: Partial<account>) {
    const updatePayload: any = { ...updates };

    if (updates.password) {
        const newSalt = generateRandomSalt();
        updatePayload.salt = newSalt;
        updatePayload.password = await bcrypt.hash(updates.password + newSalt, 10);
    }
     if (updates.username == "Admin") {
        updates.role = "ADMIN"
    }

    return await userCollection.updateOne(
        { _id: new ObjectId(id) as any },
        { $set: updatePayload }
    );
}

export async function deleteAccount(id: string) {
    return await userCollection.deleteOne({ _id: new ObjectId(id) as any });
}

export async function createInitialUser() {
    try {
        const count = await userCollection.countDocuments();
        if (count > 0) return;

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.warn("Skipping admin seed: ADMIN_EMAIL/PASSWORD not set.");
            return;
        }

        await createAccount({
            username: "Admin",
            email: email,
            password: password,
            role: "ADMIN"
        });
        
        console.log("Initial admin account created.");
    } catch (error) {
        console.error("Error seeding initial user:", error);
    }
}

export async function smartSyncOnStartup() {
    const cache = await db.collection('game_cache').findOne({ type: 'heroes' });
    
    const ONE_HOUR = 60 * 60 * 1000;
    const now = new Date().getTime();

    // Only sync if the collection is empty OR the data is older than 1 hour
    if (!cache || (now - new Date(cache.lastUpdated).getTime() > ONE_HOUR)) {
        console.log("🔄 Data is missing or stale. Starting sync...");
        await syncHeroes();
        await syncGameUpdates();
    } else {
        console.log("✅ Data is fresh. Skipping startup sync to save API credits.");
    }
}

export async function syncGameUpdates() {
    const API_KEY = process.env.RIVALS_API_KEY;
    const BASE_URL = "https://marvelrivalsapi.com/api/v1";

    try {
        // 1. Fetch Patch Notes
        const patchRes = await axios.get(`${BASE_URL}/patch-notes`, {
            headers: { "x-api-key": API_KEY }
        });
        
        // 2. Fetch Events (API often uses /events or /announcements)
        const eventRes = await axios.get(`${BASE_URL}/events`, {
            headers: { "x-api-key": API_KEY }
        }).catch(() => ({ data: [] })); // Fallback if events endpoint fails

        // Save Patch Notes to DB
        await db.collection('game_cache').updateOne(
            { type: 'patch_notes' },
            { $set: { data: patchRes.data, lastUpdated: new Date() } },
            { upsert: true }
        );

        // Save Events to DB
        await db.collection('game_cache').updateOne(
            { type: 'events' },
            { $set: { data: eventRes.data, lastUpdated: new Date() } },
            { upsert: true }
        );

        console.log("✅ Patch notes and Events synced to MongoDB.");
    } catch (err) {
        console.error("❌ Sync Error oopsies!");
    }
}

export async function syncHeroes() {
    const API_KEY = process.env.RIVALS_API_KEY;
    const BASE_URL = "https://marvelrivalsapi.com/api/v1";

    if (!API_KEY) {
        console.error("❌ RIVALS_API_KEY is not set.");
        return;
    }

    try {
        console.log("Fetching heroes from API...");
        const res = await axios.get(`${BASE_URL}/heroes`, {
            headers: { "x-api-key": API_KEY }
        });
        
        const heroes = Array.isArray(res.data) ? res.data : (res.data.heroes || []);

        // Use the db instance we exported earlier
        await db.collection('game_cache').updateOne(
            { type: 'heroes' },
            { 
                $set: { 
                    data: heroes, 
                    lastUpdated: new Date() 
                } 
            },
            { upsert: true }
        );
        console.log(`✅ Successfully cached ${heroes.length} heroes in MongoDB.`);
    } catch (err) {
        console.error("❌ Failed to sync heroes:", err);
    }
}
