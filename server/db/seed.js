const sequelize = require('.');

async function seed() {
  await sequelize.sync({ force: true });

  var ex1 = await sequelize.models.webpage.create(
    {
      protocol: 'http',
      host: 'example.com',
      port: 80
    }
  );

  var ex2 = await sequelize.models.webpage.create(
    {
      protocol: 'https',
      host: 'marg.town',
      port: 443
    }
  );

  ex1.createSnapshot({
    image: "testimg",
    headers: "{test: 'header1', test2: 'header2'}",
    status_code: 200,
    page_title: 'test title'
  })

  ex2.createSnapshot({
    image: "testimg2",
    headers: "{test2: 'header3', test3: 'header4'}",
    status_code: 500,
    page_title: 'test title 2'
  })
  
  console.log('DB Seeded!');
}

seed();