import log from 'electron-log/main';
import path from 'path';
import settings from '@/main/settings';
import dayjs from 'dayjs';

log.initialize({ preload: true });

log.transports.file.level = 'info';
log.transports.file.resolvePathFn = () => {
  const dateString = dayjs().format('YYYY-MM-DD');
  return path.join(settings.libraryPath(), 'logs', `main-${dateString}.log`);
};
log.errorHandler.startCatching();

export default log;
