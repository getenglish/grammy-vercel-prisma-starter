#!/usr/bin/env tsx
/* eslint-disable antfu/no-top-level-await */

import type { PollingConfig } from '#root/config.js'
import type { RunnerHandle } from '@grammyjs/runner'
import process from 'node:process'
import { createBot } from '#root/bot/index.js'
import { config } from '#root/config.js'
import { logger } from '#root/logger.js'
import { prisma } from '#root/prisma/index.js'
import { run } from '@grammyjs/runner'

async function startPolling(config: PollingConfig) {
  const bot = createBot(config.botToken, {
    config,
    logger,
    prisma,
  })
  let runner: undefined | RunnerHandle

  // graceful shutdown
  onShutdown(async () => {
    logger.info('Shutdown')
    await runner?.stop()
  })

  await Promise.all([
    bot.init(),
    bot.api.deleteWebhook(),
  ])

  // connect to database
  logger.info('Connecting to database...')
  await prisma.$connect()
  logger.info('Database connected')

  // start bot
  runner = run(bot, {
    runner: {
      fetch: {
        allowed_updates: config.botAllowedUpdates,
      },
    },
  })

  logger.info({
    msg: 'Bot running...',
    username: bot.botInfo.username,
  })
}

try {
  if (config.isPollingMode)
    await startPolling(config)
}
catch (error) {
  logger.error(error)
  process.exit(1)
}

// Utils

function onShutdown(cleanUp: () => Promise<void>) {
  let isShuttingDown = false
  const handleShutdown = async () => {
    if (isShuttingDown)
      return
    isShuttingDown = true
    await cleanUp()
  }
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
}
