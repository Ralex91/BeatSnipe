import chalk from "chalk"
import dayjs from "dayjs"

type LogLevel = "info" | "warn" | "error" | "success"
interface LoggerTheme {
  color: typeof chalk
  name: string
}

export class Logger {
  private static themes: Record<string, LoggerTheme> = {
    scoresaber: { color: chalk.yellow.bold, name: "SS" },
    beatleader: { color: chalk.magenta.bold, name: "BL" },
    discord: { color: chalk.hex("#5865F2").bold, name: "DISCORD" },
    default: { color: chalk.white.bold, name: "LOG" },
  }

  private static getLogLevelStyle(level: LogLevel | null): typeof chalk {
    switch (level) {
      case "warn":
        return chalk.yellow

      case "error":
        return chalk.red

      case "success":
        return chalk.green

      default:
        return chalk.white
    }
  }

  private static getTheme(context: string): LoggerTheme {
    if (this.themes[context]) {
      return this.themes[context]
    }

    const upperContext = context.toUpperCase()
    for (const [key, theme] of Object.entries(this.themes)) {
      if (
        key.toUpperCase().includes(upperContext) ||
        upperContext.includes(key.toUpperCase())
      ) {
        return theme
      }
    }

    return {
      ...this.themes.default,
      name: context.toUpperCase(),
    }
  }

  private static getTimestamp(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss")
  }

  static log(
    context: string,
    message: string,
    level: LogLevel | null = null,
  ): void {
    const theme = this.getTheme(context)
    const levelStyle = this.getLogLevelStyle(level)
    const timestamp = this.getTimestamp()

    const coloredTimestamp = chalk.gray(`[${timestamp}]`)
    const coloredPrefix = theme.color(`[${theme.name}]`)
    const coloredMessage = levelStyle(message)

    console.log(`${coloredTimestamp} ${coloredPrefix} ${coloredMessage}`)
  }

  static info(context: string, message: string): void {
    this.log(context, message, "info")
  }

  static warn(context: string, message: string): void {
    this.log(context, message, "warn")
  }

  static error(context: string, message: string): void {
    this.log(context, message, "error")
  }

  static success(context: string, message: string): void {
    this.log(context, message, "success")
  }

  static comparison(
    context: string,
    value1: number,
    value2: number,
    isPositive: boolean = false,
    label?: string,
  ): void {
    const theme = this.getTheme(context)
    const timestamp = this.getTimestamp()

    const coloredTimestamp = chalk.gray(`[${timestamp}]`)
    const coloredPrefix = theme.color(`[${theme.name}]`)

    let coloredValue1: string = ""
    let coloredValue2: string = ""
    let operator: string = ""

    if (isPositive) {
      coloredValue1 = chalk.green.bold(value1.toString())
      coloredValue2 = chalk.red(value2.toString())
      operator = chalk.green.bold(">")
    } else {
      coloredValue1 = chalk.red(value1.toString())
      coloredValue2 = chalk.green.bold(value2.toString())
      operator = chalk.red("<")
    }

    const comparison = `${coloredValue1} ${operator} ${coloredValue2}`
    const fullMessage = label ? `${label}: ${comparison}` : comparison

    console.log(`${coloredTimestamp} ${coloredPrefix} ${fullMessage}`)
  }
}
