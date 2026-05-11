import express from 'express';
import { db, getAccountById, setFavoriteHero } from '../controllers/databaseController'; // Make sure the path is correct


import { secureMiddleware } from "../SecurityMiddleware";
const router = express.Router();

router.get('/heroes',secureMiddleware, async (req, res) => {
    try {
        // Now 'db' is recognized!
        const cache = await db.collection('game_cache').findOne({ type: 'heroes' });
        let heroes = cache ? cache.data : [];
        const sessionUser = req.session.user;
        const account = sessionUser ? await getAccountById(sessionUser.id) : null;
        const favoriteHeroes = new Set((account?.favoriteHeroes || []).map(String));

        // Sorting logic based on the dropdown
        const sortType = req.query.sort;
        if (sortType === 'HP') {
            heroes.sort((a: any, b: any) => 
                (parseInt(b.transformations?.[0]?.health) || 0) - (parseInt(a.transformations?.[0]?.health) || 0)
            );
        } else if (sortType === 'name') {
            heroes.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        heroes = [
            ...heroes.filter((hero: any) => favoriteHeroes.has(String(hero.id))),
            ...heroes.filter((hero: any) => !favoriteHeroes.has(String(hero.id)))
        ];

        res.render('heroes', { 
            heroes, 
            favoriteHeroes,
            selectedSort: sortType,
            currentPage: 'heroes',
            IMG_BASE: "https://marvelrivalsapi.com",
            SKIN_BASE: "https://marvelrivalsapi.com/rivals" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading heroes");
    }
});

router.post('/heroes/:id/favorite', secureMiddleware, async (req, res) => {
    try {
        const sessionUser = req.session.user;
        if (!sessionUser) return res.redirect('/login');

        const heroId = String(req.params.id);
        const isFavorite = req.body.favorite === 'true';
        const sort = typeof req.body.sort === 'string' ? req.body.sort : '';

        await setFavoriteHero(sessionUser.id, heroId, isFavorite);

        res.redirect(sort ? `/heroes?sort=${encodeURIComponent(sort)}` : '/heroes');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating favorite hero");
    }
});

router.get('/heroes/:id',secureMiddleware, async (req, res) => {
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
