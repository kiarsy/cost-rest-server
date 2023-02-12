import { PrismaClient } from '@prisma/client';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser'

const port = 3000;

// Instances
const prisma = new PrismaClient();

// Webserver
const app: Express = express();
app.use(bodyParser.json())


app.get('/', (req: Request, res: Response) => {
    res.send('Cost Server');
});

app.get('/GetAll', (req: Request, res: Response) => {
    const id = req.body.id;
    console.log("GetAll:", id);
});


app.listen(port, () => {
    console.log(`[server]: Server new is running at http://localhost:${port}`);
});