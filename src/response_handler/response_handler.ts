import { IResponse } from '../@types/types';
import logger from '../logger/logger';

export const return_response = ({
  req,
  res,
  data,
  message,
  status_code = 200,
}: IResponse) => {
  if (status_code < 400) {
    logger.info(`Response for ${req.method} ${req.url}: ${status_code}`);
  } else if (status_code == 422) {
  } else {
    logger.error(`Response for ${req.method} ${req.url}: ${status_code}`);
  }

  res.status(status_code).json({
    success: status_code < 400,
    message,
    data,
  });
};
