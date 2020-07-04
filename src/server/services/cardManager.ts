import Debug from 'debug'; const debug = Debug('tixid:services:cardSetManager');
import { promises as fs } from 'fs';
import path from 'path';
import { uuid } from 'uuidv4';
import { Card, CardSet } from '../../shared/model/card';

const _appFolder = 'dist/client';
const _contextFolder = 'dist/context'
const _cardSetsFolder = path.join(_appFolder, 'assets', 'cardSets');
const _cardDbPath = path.join(_contextFolder, 'cards.json');


class CardSetManager {
    sets: Record<string, CardSet> = {};
    cards: Record<string, Card> = {};

    async init() {
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
        try {
            await fs.writeFile(_cardDbPath, JSON.stringify(cardsDb));
        } catch (err) {
            debug(err);
        }

        debug(`Updated card DB with ${Object.keys(this.cards).length} cards.`);
    }
}

export default new CardSetManager();