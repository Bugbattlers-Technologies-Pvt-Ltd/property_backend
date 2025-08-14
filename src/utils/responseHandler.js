const responseHandler = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = 'Internal server error', statusCode = 500, error = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(error && { error })
    });
  },

  paginated: (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }
};

module.exports = { responseHandler };


