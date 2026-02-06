import { io, Socket } from "socket.io-client"
import { Capacitor } from "@capacitor/core"

const getSocketUrl = () => {
    // Override via env if needed
    if (import.meta.env.VITE_API_URL) {
        // Remove /api suffix if present for socket connection
        return import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    }

    if (Capacitor.isNativePlatform()) {
        return "https://barbershop-graph-api.vercel.app"
    }

    // Default development
    return import.meta.env.PROD ? window.location.origin : "http://localhost:3000"
}

let socket: Socket | null = null

export const connectSocket = (barberId: string) => {
    const url = getSocketUrl()
    
    if (!socket) {
        socket = io(url, {
            transports: ["websocket", "polling"],
        })
        
        socket.on("connect", () => {
            console.log("Socket connected")
        })

        socket.on("disconnect", () => {
            console.log("Socket disconnected")
        })
    }
    
    // Join the barber's specific room
    socket.emit("joinBarberRoom", barberId)

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export const getSocket = () => socket
