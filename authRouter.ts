import express from 'express';
import { login, createAccount, createInitialUser } from './databaseController';

const router = express.Router();

// GET: Render the login page
router.get('/login', async (req, res) => {
    res.render('login', { error: null });
});

router.get('/landing', (req, res) => {
    res.render('landing')
});

// POST: Handle both Login and Registration
router.post('/auth', async (req, res) => {
    const { mode, email, password, username } = req.body;

    try {
        if (mode === 'register') {
            // Registration Logic
            await createAccount({
                username,
                email,
                password,
                role: "USER"
            });
            return res.redirect('/login?msg=AccountCreated');
            
        } else {
            // Login Logic
            const user = await login(email, password);
            if (user) {
                // Here you would typically set up a session or JWT
                // req.session.user = user; 
                return res.redirect('/landing');
            } else {
                return res.render('login', { error: "Invalid email or password." });
            }
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: "An error occurred. Please try again." });
    }
});

export default router;