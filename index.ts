import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import authRouter from './authRouter';

dotenv.config();

// all links to API (refer to On the subject of API's to import properly and only load once!)
// (will be reused countless times, hence loading the data once will speedup our load times!)
// (async ofc)
// (idk interface yet, handle it.)
const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";
const SKIN_BASE = "https://marvelrivalsapi.com/rivals";

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// there are admin and user roles, implement a site page that pulls all the accounts for admins to be able to delete and edit someone else's user data,
// including password incase of account loss
app.use(authRouter);
// heroes router, hero router, news router, detail router and stat router, lastly a game explain website aswell and in the auth router
// add the previously mentioned functionalities
// setup partials here!
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3001);

app.get("/", (req, res) => {
  res.render("index", {
    title: "Team Rivals",
  });
});


app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});
