import express from 'express';
import PageViewModel from 'viewModels/pageViewModel';
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', new PageViewModel("QIND"));
});

// module.exports = router;
export default router;
