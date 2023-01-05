import { DataSource } from 'typeorm';
import logger from './winston';

const AppDataSource = new DataSource({
    name: 'jack-default',
    type: 'mysql',
    host: process.env.TYPEORM_HOST,
    port: <number>(<unknown>process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [__dirname + '/entities/*.entity.js'],
    synchronize: false,
    logging: false,
    timezone: '+07:00',
});

AppDataSource.initialize()
    .then(connection => {
        logger.info(`Database connected. On port ${process.env.TYPEORM_PORT}`);
        console.log(`Database connected. On port ${process.env.TYPEORM_PORT}`);

    })
    .catch(err => {
        logger.error(err);
        logger.error('Error establishing a database connection.');
        console.log('Error establishing a database connection.', err);

    });

export { AppDataSource };

// createConnection({
//     name: 'jack-default',
//     type: 'mysql',
//     host: process.env.TYPEORM_HOST,
//     port: <number>(<unknown>process.env.TYPEORM_PORT),
//     username: process.env.TYPEORM_USERNAME,
//     password: process.env.TYPEORM_PASSWORD,
//     database: process.env.TYPEORM_DATABASE,
//     entities: [__dirname + '/entities/*.entity.js'],
//     synchronize: false,
//     logging: true,
//     timezone: '+07:00',
// })
//     .then(connection => {
//         logger.info(`Database connected. On port ${process.env.TYPEORM_PORT}`);
//     })
//     .catch(error => {
//         logger.error(error);
//         logger.error('Error establishing a database connection.');
//     });
