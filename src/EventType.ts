export type EventType = {
    mail: {
        from: string,
        to: string,
        id: string
    },
    meta: {
        bank: string, accountNumber: number
    },
    record: {
        credit: number,
        debit: number,
        currency: string,
        date: string,
        description: string
    }
}

export function getEmail(email: string) {
    const r = /([\w\.]+@([\w-]+\.)+[\w-]{2,4})/g.exec(email);
    if (r && r?.length > 0)
        return r[0];
    return undefined;
}