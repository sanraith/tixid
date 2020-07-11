import express from 'express';
import Debug from 'debug';
import cardManager from '../services/cardManager';
import path from 'path';

const debug = Debug('tixid:routes:card');
const router = express.Router();

const _app_client_folder = 'dist/client';
const _app_cardSets_folder = 'assets/cardSets';

router.get("/:cardId", (req, res) => {
    const cardId = req.params["cardId"];
    const card = cardManager.cards[cardId];
    const cardPath = path.join(_app_cardSets_folder, card.path);

    // TODO serve 304 for subsequent requests
    res.status(200).sendFile(cardPath, { root: _app_client_folder });
})

export default router;