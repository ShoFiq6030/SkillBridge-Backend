import express, { Application } from "express";

import cors from 'cors';


const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:4000", // client side url
    credentials: true
}))

app.use(express.json());


app.get("/", (req, res) => {
    res.send("Welcome to SkillBridge API!");
});


export default app;