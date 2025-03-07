module.exports = {
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;
        await sock.sendMessage(chatId, { text: "Pong! 🏓" });
    }
};
