import express from 'express';
import PageViewModel from '../viewModels/pageViewModel';
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', new PageViewModel("Home"));
});

// module.exports = router;
export default router;
