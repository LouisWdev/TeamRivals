import express from 'express';
import { login, createAccount, createInitialUser } from '../controllers/databaseController';
import session from 'express-session';

// This forces TypeScript to merge the types in this specific file
declare module 'express-session' {
    interface SessionData {
        user: {
            id: string;
            username: string;
            email: string;
        };
    }
}
const router = express.Router();

// GET: Render the login page
router.get('/login', async (req, res) => {
    res.render('login', { error: null });
});

router.get('/landing', (req, res) => {
    res.render('landing', {currentPage: "landing"})
});

// POST: Handle both Login and Registration
// POST: Handle both Login and Registration
router.post('/auth', async (req, res) => {
    const { mode, email, password, username } = req.body;

    try {
        if (mode === 'register') {
            await createAccount({ username, email, password, role: "USER" });
            return res.redirect('/login?msg=AccountCreated');
        } else {
            const user = await login(email, password);
            if (user) {
                // Use "as any" or a specific intersection type
                const user = await login(email, password) as any; 

                if (user) {
                    req.session.user = {
                        id: user._id.toString(), 
                        username: user.username,
                        email: user.email
                    };
                }
                
                // IMPORTANT: Save the session before redirecting 
                // to ensure the data is written before the next page loads
                req.session.save((err) => {
                    if (err) console.error("Session save error:", err);
                    return res.redirect('/landing');
                });
            } else {
                return res.render('login', { error: "Invalid email or password." });
            }
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: "An error occurred." });
    }
});

// Add a Logout route to clear the session
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

export default router;