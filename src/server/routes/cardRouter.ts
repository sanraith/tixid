import express from 'express';
import Debug from 'debug';
import cardManager from '../services/cardManager';
import path from 'path';
import { CardSetInfo, GetCardSetsResponse } from 'src/shared/responses';
import routerErrorHandler from './routerErrorHandler';

const debug = Debug('tixid:routes:card');
const errorDebug = Debug('tixid:routes:card:ERROR');
const errorHandler = routerErrorHandler(errorDebug);
const cardRouter = express.Router();
const cardSetRouter = express.Router();

const _app_client_folder = 'dist/client';
const _app_assets_folder = 'assets';
const _app_cardSets_folder = path.join(_app_assets_folder, 'cardSets');
const _cardback_path = path.join(_app_assets_folder, 'cardback.jpg');

cardSetRouter.get("/", (req, res) => {
    errorHandler(res, () => {
        res.json(<GetCardSetsResponse>{
            cardSets: Object.values(cardManager.sets).map(set => (<CardSetInfo>{
                id: set.id,
                name: set.name,
                cardCount: set.cards.length,
                cards: set.cards.filter((_, i) => i < 5).map(c => c.id)
            }))
        });
    });
});

cardRouter.get("/:cardId", (req, res) => {
    errorHandler(res, () => {
        const cardId = req.params["cardId"];
        if (cardId === "cardback") {
            res.sendFile(_cardback_path, { root: _app_client_folder });
            return;
        }

        const card = cardManager.cards[cardId];
        if (card) {
            const cardPath = path.join(_app_cardSets_folder, card.path);
            // TODO serve 304 based on file changes
            res.sendFile(cardPath, { root: _app_client_folder });
        } else {
            res.status(404);
        }
    });
})

export { cardRouter, cardSetRouter };