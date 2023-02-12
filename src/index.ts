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

app.get('/GetAll', async (req: Request, res: Response) => {
    const id = req.body.id;
    console.log("GetAll:", id);

    const categories = await prisma.category.findMany({ where: { userId: id } });
    const filterCategory = await Promise.all(categories.map(async (it) => {
        const filter = await prisma.filter.findMany({ where: { categoryId: it.id } });
        return {
            category: it,
            filters: filter
        }
    }));

    const aggregate = await Promise.all(filterCategory.map(async (it) => {

        const filterCost = await Promise.all(it.filters.map(async (filter) => {
            const costs = await prisma.cost.findMany({ where: { description: { contains: filter.matchText } } });
            const totalDebit = costs.reduce((accumulator, curValue) => {
                return accumulator + curValue.debit
            }, 0);
            const totalCredit = costs.reduce((accumulator, curValue) => {
                return accumulator + curValue.credit
            }, 0);

            return {
                category: it.category.name,
                filter: filter.name,
                costs,
                totalDebit,
                totalCredit
            }
        }));

        const totalCredit = filterCost.reduce((accumulator, curValue) => {
            return accumulator + curValue.totalCredit;
        }, 0);

        const totalDebit = filterCost.reduce((accumulator, curValue) => {
            return accumulator + curValue.totalDebit;
        }, 0);

        return {
            category: it.category.name,
            totalCredit,
            totalDebit,
            filters: filterCost,

        }

    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(aggregate, null, 3));
});


app.listen(port, () => {
    console.log(`[server]: Server new is running at http://localhost:${port}`);
});