import { Response } from 'express';
import Debug from 'debug';
import shortid from 'shortid';

export default (errorDebug: Debug.Debugger) => (res: Response<any>, action: () => void) => {
    try {
        action();
    } catch (error) {
        const errorId = `err_${shortid()}`;
        errorDebug(`${errorId}:`, error);
        res.status(500).send(`Internal server error. Id: ${errorId}`);
    }
}