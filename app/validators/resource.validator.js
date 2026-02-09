const Joi = require("joi");

const moduleSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  summary: Joi.string().min(3).max(500).optional(),
  task: Joi.string().min(3).max(800).optional()
});

const resourceCreateSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().min(10).max(1000).required(),
  content: Joi.string().min(10).max(5000).optional(),
  modules: Joi.array().items(moduleSchema).min(1).optional(),
  status: Joi.boolean().optional(),
  dueDate: Joi.date().optional()
});

const resourceUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(120).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  content: Joi.string().min(10).max(5000).optional(),
  modules: Joi.array().items(moduleSchema).min(1).optional(),
  status: Joi.boolean().optional(),
  dueDate: Joi.date().optional()
});

module.exports = {
  resourceCreateSchema,
  resourceUpdateSchema
};