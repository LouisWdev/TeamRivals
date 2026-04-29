import express from 'express';
import { db } from '../controllers/databaseController'; // Make sure the path is correct

const router = express.Router();

router.get('/heroes', async (req, res) => {
    try {
        // Now 'db' is recognized!
        const cache = await db.collection('game_cache').findOne({ type: 'heroes' });
        let heroes = cache ? cache.data : [];

        // Sorting logic based on the dropdown
        const sortType = req.query.sort;
        if (sortType === 'HP') {
            heroes.sort((a: any, b: any) => 
                (parseInt(b.transformations?.[0]?.health) || 0) - (parseInt(a.transformations?.[0]?.health) || 0)
            );
        } else if (sortType === 'name') {
            heroes.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        res.render('heroes', { 
            heroes, 
            currentPage: 'heroes',
            IMG_BASE: "https://marvelrivalsapi.com",
            SKIN_BASE: "https://marvelrivalsapi.com/rivals" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading heroes");
    }
});

router.get('/heroes/:id', async (req, res) => {
    try {
        const heroId = req.params.id;
        
        // 1. Get all heroes from cache
        const cache = await db.collection('game_cache').findOne({ type: 'heroes' });
        const allHeroes = cache ? cache.data : [];

        // 2. Find the specific hero (checking both id and name for safety)
        const hero = allHeroes.find((h: any) => String(h.id) === heroId || h.name === heroId);

        if (!hero) {
            return res.status(404).send("Hero not found");
        }

        // 3. Get 4 "Other Heroes" (randomized or just sliced, excluding current)
        const otherHeroes = allHeroes
            .filter((h: any) => String(h.id) !== String(hero.id))
            .slice(0, 4);

        res.render('heroDetail', { 
            hero, 
            otherHeroes,
            currentPage: 'heroes',
            IMG_BASE: "https://marvelrivalsapi.com",
            SKIN_BASE: "https://marvelrivalsapi.com/rivals"
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

export default router;