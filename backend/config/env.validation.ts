import * as Joi from 'joi';

/**
 * Schema for the environment variables the app cannot safely start without.
 * Wire this into ConfigModule.forRoot({ validate }) so a missing/invalid
 * value fails fast at boot instead of surfacing as a confusing runtime error.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
}).unknown(true);

export function validateEnv(config: Record<string, unknown>) {
  const { error, value } = envValidationSchema.validate(config, {
    abortEarly: false,
  });

  if (error) {
    throw new Error(
      `Missing/invalid required environment variables:\n${error.message}`,
    );
  }

  return value;
}
