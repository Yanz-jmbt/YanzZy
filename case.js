// case.js
export async function handleMessage(sock, msg, cfg) {
  const sender = msg.key.remoteJid;
  const text   =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";
  const body   = text.trim();
  const isCmd  = body.startsWith(cfg.prefix);
  const cmd    = isCmd ? body.slice(cfg.prefix.length).split(" ")[0].toLowerCase() : "";

  if (!isCmd) {
    // tanpa prefix → auto-reply sederhana
    if (/^halo|hai|hi/i.test(body))
      return sock.sendMessage(sender, { text: "Halo juga 👋" });
    return;
  }

  switch (cmd) {
    case "ping":
      await sock.sendMessage(sender, { text: "pong 🏓" });
      break;

    case "menu":
      await sock.sendMessage(sender, {
        text:
`🤖 *${cfg.botName} Menu*
${cfg.prefix}ping  – tes respon
${cfg.prefix}menu  – tampilkan menu`
      });
      break;

    // tambahkan perintah baru di sini

    default:
      await sock.sendMessage(sender, { text: "Perintah tidak dikenal 😕" });
  }
}