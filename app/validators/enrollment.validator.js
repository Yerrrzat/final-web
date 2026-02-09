const Joi = require("joi");

const moduleProgressSchema = Joi.object({
  moduleIndex: Joi.number().min(0).required(),
  completed: Joi.boolean().required()
});

module.exports = { moduleProgressSchema };