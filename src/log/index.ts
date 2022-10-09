// it is ok to use console in this file, it is where we log
// tslint:disable:no-console

import chalk from 'chalk'

export const log = (level: 'warn' | 'error' | 'info', message: string) => {
  switch (level) {
    case 'warn':
      console.warn(chalk.yellow(message))
      break
    case 'error':
      console.error(chalk.red(message))
      break
    case 'info':
      console.info(chalk.green(message))
      break
  }
}
