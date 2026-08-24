import { Room, RoomEvent, ConnectionState } from "livekit-client";

export { ConnectionState };

export type ConnectionStateCallback = (state: ConnectionState) => void;
export type DataReceivedCallback = (data: any, participant: any, topic?: string) => void;
export type ParticipantCallback = (participant: any) => void;

export class LiveKitService {
  private currentRoom: Room | null = null;

  async connect(
    url: string,
    token: string,
    callbacks: {
      onStateChanged?: ConnectionStateCallback;
      onDataReceived?: DataReceivedCallback;
      onParticipantConnected?: ParticipantCallback;
      onParticipantDisconnected?: ParticipantCallback;
      onDisconnected?: (reason?: any) => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<Room> {
    if (this.currentRoom) {
      await this.disconnect();
    }

    console.log("[LiveKit] connecting");
    console.log("[LiveKit] URL:", url);

    const room = new Room({
      publishDefaults: { simulcast: false },
    });

    room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log("[LiveKit] connection state:", state);
      callbacks.onStateChanged?.(state);
    });

    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any, _kind: any, topic?: string) => {
      const topicName = topic || "chat.message";
      console.log(`[LiveKit] DataReceived topic=${topicName}`);
      console.log("[LiveKit] payload bytes:", payload ? payload.byteLength : 0);
      console.log("[LiveKit] sender identity:", participant?.identity || "server/broadcast");

      try {
        const str = new TextDecoder().decode(payload);
        const data = JSON.parse(str);
        console.log("[LiveKit] decoded payload:", data);

        // Process packets matching topic 'chat.message' or standard chat packet structure
        if (topicName === "chat.message" || data?.type === "chat_message" || data?.type === "CHAT_MESSAGE" || data?.message || data?.content) {
          callbacks.onDataReceived?.(data, participant, topicName);
        } else {
          console.warn("[LiveKit] Ignored unknown data packet topic/type:", topicName, data?.type || data);
        }
      } catch (err) {
        console.error("[LiveKit] Decoding error:", err);
      }
    });

    room.on(RoomEvent.ParticipantConnected, (p: any) => {
      console.log("[LiveKit] remote participant connected", p.identity);
      callbacks.onParticipantConnected?.(p);
    });

    room.on(RoomEvent.ParticipantDisconnected, (p: any) => {
      console.log("[LiveKit] remote participant disconnected", p.identity);
      callbacks.onParticipantDisconnected?.(p);
    });

    room.on(RoomEvent.Disconnected, (reason: any) => {
      console.log("[LiveKit] room disconnected", reason);
      callbacks.onDisconnected?.(reason);
    });

    try {
      await room.connect(url, token);
      this.currentRoom = room;

      console.log("[LiveKit] connected");
      console.log("[LiveKit] room name:", room.name);
      console.log("[LiveKit] local participant identity:", room.localParticipant.identity);

      const remoteIdentities = Array.from(room.remoteParticipants.values()).map((p) => p.identity);
      console.log("[LiveKit] remote participants:", remoteIdentities);

      return room;
    } catch (error) {
      console.error("[LiveKit] connection error:", error);
      callbacks.onError?.(error);
      throw error;
    }
  }

  // Deprecated for chat messages (Backend server now broadcasts via RoomServiceClient.sendData)
  async publishData(dataObj: any): Promise<void> {
    if (!this.currentRoom || this.currentRoom.state !== ConnectionState.Connected) {
      throw new Error("LiveKit room is not connected");
    }

    console.warn("[LiveKit] Local publishData called. Note: Backend now handles server-side broadcasting.");
    const jsonString = JSON.stringify(dataObj);
    const payload = new TextEncoder().encode(jsonString);

    await this.currentRoom.localParticipant.publishData(payload, {
      reliable: true,
    });
  }

  getRemoteIdentities(): string[] {
    if (!this.currentRoom) return [];
    return Array.from(this.currentRoom.remoteParticipants.values()).map((p) => p.identity);
  }

  getLocalIdentity(): string {
    return this.currentRoom?.localParticipant?.identity || "Disconnected";
  }

  getRoomName(): string {
    return this.currentRoom?.name || "N/A";
  }

  async disconnect(): Promise<void> {
    if (this.currentRoom) {
      try {
        await this.currentRoom.disconnect();
      } catch (e) {
        console.warn("[LiveKit] Error disconnecting room", e);
      }
      this.currentRoom = null;
    }
  }
}
