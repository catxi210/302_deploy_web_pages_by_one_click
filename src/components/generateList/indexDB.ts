import dayjs from 'dayjs'
import { IRecord } from '@/stores';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'ai-static-website-deployment-database';
const STORE_NAME = 'ai-static-website-deployment-store';

interface MyDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: IRecord
    };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
    const db = await openDB<MyDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
    return db;
}

let db: IDBPDatabase<MyDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MyDB>> {
    if (!db) {
        db = await initDB();
    }
    return db;
}

export async function addData(data: Omit<IRecord, 'id' | 'createdAt'>): Promise<IRecord[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
    await store.add({ ...data, createdAt })
    await tx.done;
    return deleteExpiredData();
}

export async function deleteData(id: number): Promise<IRecord[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).delete(id);
    await tx.done;
    return deleteExpiredData();
}

export async function getLsit(): Promise<IRecord[]> {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const allRecords = await store.getAll();
    return allRecords.sort((a, b) => b.id! - a.id!);
}

export async function deleteExpiredData(): Promise<IRecord[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const allRecords = await store.getAll();
    const currentTime = +dayjs().unix();

    const deletePromises = allRecords
        .filter(record => (record.deadline !== '0' && +dayjs(record.deadline).unix() <= currentTime))
        .map(record => store.delete(record.id!));

    await Promise.all(deletePromises);
    await tx.done;

    return getLsit();
}
