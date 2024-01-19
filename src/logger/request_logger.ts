import { Application } from 'express';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';

const log_directory = 'logs';
const request_log_file = 'requests.log';
const request_log_rolling_interval = '1d';
const request_log_format =
  '[:date[iso]] :method :url :status :response-time ms - :res[content-length]';

const accessLogStream = createStream(request_log_file, {
  interval: request_log_rolling_interval,
  path: log_directory,
});

const console_appender = morgan(request_log_format);
const file_appender = morgan(request_log_format, {
  stream: accessLogStream,
});

export const register_request_logger = (app: Application) => {
  if (process.env.NODE_ENV === 'production') {
    app.use(file_appender);
  } else {
    app.use(console_appender);
  }
};
