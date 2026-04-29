import express from 'express';
import { db } from '../controllers/databaseController'; // Make sure the path is correct
import axios from 'axios'


const router = express.Router();


router.get('/stats', async (req, res) => {
    try {
        const cache = await db.collection('game_cache').findOne({ type: 'heroes' });
        const heroes = cache ? cache.data : [];

        // 1. Calculate Role Breakdown
        const roles: Record<string, number> = {};
        heroes.forEach((h: any) => {
            const role = h.role || "Unknown";
            roles[role] = (roles[role] || 0) + 1;
        });

        // 2. Pick Featured Heroes (One per role, max 3)
        const featured: any[] = [];
        const seenRoles = new Set();
        for (const h of heroes) {
            if (!seenRoles.has(h.role) && featured.length < 3) {
                featured.push(h);
                seenRoles.add(h.role);
            }
        }

        res.render('stats', {
            heroCount: heroes.length,
            roles,
            featured,
            currentPage: 'stats',
            IMG_BASE: "https://marvelrivalsapi.com",
            SKIN_BASE: "https://marvelrivalsapi.com/rivals"
        });
    } catch (err) {
        res.status(500).send("Error loading stats");
    }
});

// GET /api/player/:username
router.get('stats/api/player/:username', async (req, res) => {
    console.log("!!! ROUTE HIT !!!"); // If you don't see this, the JS path is wrong
    
    try {
        const { username } = req.params;
        const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
        
        const url = `https://marvelrivalsapi.com/api/v1/player/${encodeURIComponent(username)}`;
        console.log("Fetching from:", url);

        const response = await axios.get(url, {
            headers: { "x-api-key": API_KEY }
        });

        console.log("API Response received!");
        return res.json(response.data);

    } catch (error: any) {
    // THIS LOG IS THE KEY:
    if (error.response) {
        console.error("API DATA ERROR:", error.response.data);
        console.error("API STATUS:", error.response.status);
    } else {
        console.error("NETWORK/TIMEOUT ERROR:", error.message);
    }

    const status = error.response?.status || 500;
    res.status(status).json({ 
        error: "Player search failed",
        details: error.response?.data?.message || error.message 
    });
}
}); 
export default router;