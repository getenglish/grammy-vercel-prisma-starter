import type { Config } from '#root/config.js'
import { config } from '#root/config.js'
import { pino } from 'pino'

export function createLogger(config: Config) {
  return pino({
    level: config.logLevel,
    transport: {
      targets: [
        ...(config.isDebug
          ? [
              {
                target: 'pino-pretty',
                level: config.logLevel,
                options: {
                  ignore: 'pid,hostname',
                  colorize: true,
                  translateTime: true,
                },
              },
            ]
          : [
              {
                target: 'pino/file',
                level: config.logLevel,
                options: {},
              },
            ]),
      ],
    },
  })
}

export const logger = createLogger(config)

export type Logger = typeof logger
