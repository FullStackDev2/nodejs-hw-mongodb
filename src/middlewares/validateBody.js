import createHttpError from 'http-errors';

const validateBody = (schema) => async (req, res, next) => {
  try {
    const bodyToValidate =
      req.file && Object.keys(req.body).length === 0
        ? { photo: 'uploaded' }
        : req.body;

    await schema.validateAsync(bodyToValidate, {
      abortEarly: false,
    });

    next();
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};

export default validateBody;