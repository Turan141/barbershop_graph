import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import { getCorsOptions } from "./config"

let io: Server

export const initSocket = (httpServer: HttpServer) => {
	io = new Server(httpServer, {
		cors: getCorsOptions(),
		transports: ["polling", "websocket"]
	})

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id)

		socket.on("joinBarberRoom", (barberId: string) => {
			socket.join(`barber_${barberId}`)
			console.log(`Socket ${socket.id} joined barber room: ${barberId}`)
		})

		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id)
		})
	})

	return io
}

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!")
	}
	return io
}
