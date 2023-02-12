import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser'
import { EventType, getEmail } from './EventType';

// Environments
dotenv.config();
// let SUBSCRIPTION_COST_STORE = process.env["SUBSCRIPTION_COST_STORE"] ?? '';
// let PROJECT_ID = process.env["PROJECT_ID"] ?? '';
const port = 3000;

// Instances
const prisma = new PrismaClient();

// Webserver
const app: Express = express();
app.use(bodyParser.json())


app.post('/event', async (req: Request, res: Response) => {
    // parse body
    if (!req.body) {
        const msg = "no Pub/Sub message received";
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return
    }
    if (!req.body.message) {
        const msg = "invalid Pub/Sub message format";
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
    }



    // parse message
    const pubSubMessage = req.body.message;
    const originatorMessage = Buffer.from(pubSubMessage.data, "base64").toString().trim();
    const event: EventType = JSON.parse(originatorMessage);
    // console.log("event:", event);

    let user = await prisma.userEmails.findFirst({ where: { email: getEmail(event.mail.from) } });

    if (!user) {
        console.log("User not found:", getEmail(event.mail.from));
        return;
    }

    let account = await prisma.account.findFirst({
        where: {
            bank: event.meta.bank,
            account: String(event.meta.accountNumber),
            userId: user.userId!
        }
    });

    if (!account) {
        account = await prisma.account.create({
            data: {
                bank: event.meta.bank,
                account: String(event.meta.accountNumber),
                userId: user.userId!
            }
        });
    }

    try {
        await prisma.cost.create({
            data: {
                credit: event.record.credit,
                currency: event.record.currency,
                date: event.record.date,
                debit: event.record.debit,
                description: event.record.description,
                accountId: account.id
            }
        })
    }
    catch (e: any) {
        // if (e instanceof Prisma.PrismaClientKnownRequestError) {
        //     // P2022: Unique constraint failed
        if (e.code === 'P2002') {
            // console.error('The character already exists', e)
        }
    }
    res.status(204).send()
});

app.get('/', (req: Request, res: Response) => {
    res.send('Cost Server');
});


app.listen(port, () => {
    console.log(`[server]: Server new is running at http://localhost:${port}`);
});