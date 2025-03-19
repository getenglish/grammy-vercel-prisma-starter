import process from 'node:process'
import { createBot } from '#root/bot/index.js'
import { createConfig } from '#root/config.js'
import { createLogger } from '#root/logger.js'
import { prisma } from '#root/prisma/index.js'
import { createServer } from '#root/server/index.js'
import { handle } from '@hono/node-server/vercel'

// @ts-expect-error create config from environment variables
const config = createConfig(convertKeysToCamelCase(process.env))
const logger = createLogger(config)

const bot = createBot(config.botToken, {
  config,
  logger,
  prisma,
})
const server = createServer({
  bot,
  config,
  logger,
})

export default handle(server)
