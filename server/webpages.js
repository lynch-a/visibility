const sequelize = require('./db');
const { models } = sequelize;

async function get_webpage(req, res) {
  const webpage = await models.webpage.findOne(
    {
      where: {
        id: req.params.id
      },
      include: [{
        model: models.snapshot,
        require: true
      }]
    }
  );

  if (!webpage) {
    // todo do somethin
    res.status(404);
    res.end('Not found');
  }

  const snapshots = await webpage.getSnapshots();
  res.status(200).json({ webpage: webpage, snapshots: snapshots });
}

async function list(req, res) {
  var webpages = null;

  if (req.query.page && req.query.perpage) {
    // do pagination
    var page = req.query.page-1;
    var perpage = req.query.perpage;
    console.log("page: ", page);
    console.log("perpage: ", perpage);

    webpages = await models.webpage.findAll({
      attributes: ['id', 'host', 'port', 'protocol', [sequelize.fn('count', 'snapshot.id'), 'snapshot_count']],
      group: ['webpage.id'],
      include: [{
        model: models.snapshot,
        require: true
      }],
      offset: page * perpage,
      limit: perpage
    });
  }  else {
    // do no pagination
    webpages = await models.webpage.findAll({
      attributes: ['id', 'host', 'port', 'protocol', [sequelize.fn('count', 'snapshot.id'), 'snapshot_count']],
      include: [{
        model: models.snapshot,
        attributes: ['headers', 'status_code', 'page_title'],
        require: true
      }],
      group: ['webpage.id', 'snapshots.id']
    });
  }

  const total_webpages = await models.webpage.count();
  res.status(200).json({total: total_webpages, webpages: webpages});
}

module.exports = {
  // rest functions
  list,
  get_webpage
}