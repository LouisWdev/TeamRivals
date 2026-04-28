
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import { account } from "./interfaces";

const uri = "mongodb+srv://Louis:louis2024@ap-wo.f6fxict.mongodb.net/?appName=AP-WO"
const client = new MongoClient(uri);
const db = client.db("Rivals-Track");
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