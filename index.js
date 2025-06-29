// index.js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import pino from "pino";
import dotenv from "dotenv";
import settings from "./seting.js";
import { handleMessage } from "./case.js";

dotenv.config();
const logger = pino({ level: "silent" });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");   // sesi di folder auth
  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    printQRInTerminal: true,
    defaultQueryTimeoutMs: 60_000,
    logger
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    try {
      await handleMessage(sock, msg, settings);
      if (settings.autoread) await sock.readMessages([msg.key]);
    } catch (e) {
      console.error("💥 Handler error:", e);
    }
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const willReconnect = reason !== DisconnectReason.loggedOut;
      console.log("🔌 Connection closed.", { reason, willReconnect });
      if (willReconnect) startBot();
    } else if (connection === "open") {
      console.log(`✅  ${settings.botName} online!`);
    }
  });
}

startBot();