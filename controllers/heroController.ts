import axios from 'axios';
import cron from 'node-cron';

const API_KEY = process.env.RIVALS_API_KEY;
const BASE_URL = "https://marvelrivalsapi.com/api/v1";

// 1. Function to fetch and save to MongoDB
export async function syncHeroesWithDB(db: any) {
    try {
        const res = await axios.get(`${BASE_URL}/heroes`, {
            headers: { "x-api-key": API_KEY }
        });
        const heroes = Array.isArray(res.data) ? res.data : (res.data.heroes || []);

        await db.collection('game_cache').updateOne(
            { type: 'heroes' },
            { $set: { data: heroes, lastUpdated: new Date() } },
            { upsert: true }
        );
        console.log("✅ Marvel Rivals Hero Cache Updated");
    } catch (err) {
        console.error("❌ API Sync Failed:", err);
    }
}

// 2. Schedule it to run every hour
cron.schedule('0 * * * *', () => {
    // You'll pass your DB instance here
});