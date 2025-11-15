import app from './app';
import { pool } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

pool
  .connect()
  .then(() => {
    logger.info('✅ Conectado ao banco de dados');
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    logger.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} recebido. Encerrando servidor...`);
  pool.end().finally(() => process.exit(0));
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

