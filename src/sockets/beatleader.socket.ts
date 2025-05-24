/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import isJsonString from "@/libs/isJsonString"

export class BeatLeaderSocket {
  private socket: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private messageHandlers: Array<(data: any) => void> = []

  start() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("[BL] WebSocket already connected")

      return
    }

    this.socket = new WebSocket("wss://sockets.api.beatleader.com/scores")

    this.socket.addEventListener("open", () => {
      console.log("[BL] WebSocket connected")

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
            console.error("Error in BeatLeader handler:", err)
          }
        })
      } catch (error) {
        console.error("Invalid JSON from BeatLeader WebSocket:", error)
      }
    })

    this.socket.addEventListener("error", (e) => {
      console.error("[BL] WebSocket error:", e)
      this.socket?.close()
    })

    this.socket.addEventListener("close", () => {
      console.log("[BL] WebSocket closed")
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
    console.log("[BL] WebSocket stopped")
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
