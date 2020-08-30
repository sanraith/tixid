import Debug from 'debug'; const debug = Debug('tixid:services:cardSetManager');
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { Card, CardSet } from '../../shared/model/card';

const _appFolder = 'dist/client';
const _contextFolder = 'dist/context'
const _cardSetsFolder = path.join(_appFolder, 'assets', 'cardSets');
const _cardDbPath = path.join(_contextFolder, 'cards.json');


class CardSetManager {
    sets: Record<string, CardSet> = {};
    cards: Record<string, Card> = {};

    async init() {
        const savedDb = await this.loadSavedCardDatabaseAsync();
        if (savedDb) {
            debug("Reading existing card database...");

            this.sets = savedDb.sets.reduce((sets, set) => {
                sets[set.id] = set;
                debug(`Loaded ${set.cards.length} cards from the '${set.name}' set.`);
                return sets;
            }, <Record<string, CardSet>>{});

            this.cards = savedDb.sets
                .reduce((cards, set) => { cards.push(...set.cards); return cards; }, <Card[]>[])
                .reduce((cards, card) => { cards[card.id] = card; return cards }, <Record<string, Card>>{});

            return;
        }

        this.sets = {};
        this.cards = {};

        const cardSetsContent = await fs.readdir(_cardSetsFolder, { withFileTypes: true });
        const cardSetFolders = cardSetsContent.filter(x => x.isDirectory());

        for (const cardSetFolder of cardSetFolders) {
            const set = new CardSet(uuid(), cardSetFolder.name);
            this.sets[set.id] = set;

            const cardSetPath = path.join(_cardSetsFolder, cardSetFolder.name);
            const cardSetContent = await fs.readdir(cardSetPath, { withFileTypes: true });
            const cardFiles = cardSetContent.filter(x => x.isFile && x.name.toLowerCase().endsWith('.jpg'));

            for (const cardFile of cardFiles) {
                const card = new Card(uuid(), path.join(cardSetFolder.name, cardFile.name).replace('\\', '/'));
                set.cards.push(card);
                this.cards[card.id] = card;
            }

            debug(`Loaded ${set.cards.length} cards from the '${set.name}' set.`);
        }

        const cardsDb = {
            sets: Object.keys(this.sets).map(k => this.sets[k])
        };
        try { await fs.mkdir(_contextFolder); } catch (err) { debug(err); }
        try { await fs.writeFile(_cardDbPath, JSON.stringify(cardsDb)); } catch (err) { debug(err); }

        debug(`Updated card database with ${Object.keys(this.cards).length} cards.`);
    }

    async loadSavedCardDatabaseAsync(): Promise<{ sets: CardSet[] } | undefined> {
        let content: string = "";
        try {
            content = await fs.readFile(_cardDbPath, 'utf-8');
        } catch (err) {
            debug("No saved card database can be found.");
            return undefined;
        }
        const savedDb = <{ sets: CardSet[] }>JSON.parse(content);
        return savedDb;
    }
}

export default new CardSetManager();
