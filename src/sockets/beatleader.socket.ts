/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import isJsonString from "@/libs/isJsonString"
import { LEADERBOARD } from "@/utils/contants"
import { Logger } from "@/utils/logger"
import chalk from "chalk"

export class BeatLeaderSocket {
  private socket: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private messageHandlers: Array<(data: any) => void> = []

  start() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      Logger.error(LEADERBOARD.BeatLeader, "WebSocket already connected")

      return
    }

    this.socket = new WebSocket("wss://sockets.api.beatleader.com/scores")

    this.socket.addEventListener("open", () => {
      Logger.log(
        LEADERBOARD.BeatLeader,
        `WebSocket ${chalk.green("connected")}`,
      )

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = null
      }
    })

    this.socket.addEventListener("message", (event) => {
      const { data } = event

      if (!isJsonString(data)) {
        return
      }

      try {
        const parsed = JSON.parse(data)
        this.messageHandlers.forEach((handler) => {
          try {
            handler(parsed)
          } catch (err) {
            Logger.error(LEADERBOARD.BeatLeader, err as string)
          }
        })
      } catch (error) {
        Logger.error(LEADERBOARD.BeatLeader, error as string)
      }
    })

    this.socket.addEventListener("error", (e) => {
      Logger.error(LEADERBOARD.BeatLeader, `WebSocket error: ${e}`)

      this.socket?.close()
    })

    this.socket.addEventListener("close", () => {
      Logger.warn(LEADERBOARD.BeatLeader, "WebSocket closed")
      this.socket = null
      this.reconnectTimeout = setTimeout(() => this.start(), 1000)
    })
  }

  stop() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.socket?.close()
    this.socket = null
    Logger.warn(LEADERBOARD.BeatLeader, "WebSocket stopped")
  }

  addMessageHandler(handler: (data: any) => void) {
    this.messageHandlers.push(handler)
  }

  removeMessageHandler(handler: (data: any) => void) {
    const index = this.messageHandlers.indexOf(handler)

    if (index !== -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  clearHandlers() {
    this.messageHandlers = []
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}
