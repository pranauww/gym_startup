const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }
    next();
  };
};

// Validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

const workoutSchemas = {
  create: Joi.object({
    total_volume: Joi.number().integer().min(0),
    total_time: Joi.number().integer().min(0)
  }),
  
  addSet: Joi.object({
    exercise_id: Joi.number().integer().required(),
    reps: Joi.number().integer().min(1).required(),
    weight: Joi.number().integer().min(0),
    form_score: Joi.number().integer().min(0).max(100),
    video_url: Joi.string().uri().optional()
  })
};

module.exports = {
  validate,
  userSchemas,
  workoutSchemas
}; 