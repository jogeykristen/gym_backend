const responseHelper = (
  res,
  statusCode,
  message,
  data = {},
  statusText = {},
  extraParam = null
) => {
  res.status(statusCode || 404).json({
    message: message || "Error! Something went wrong",
    status: statusCode || 404,
    data: data || {},
    statusText: statusText || {},
    extraParam,
  });
};

module.exports = responseHelper;
