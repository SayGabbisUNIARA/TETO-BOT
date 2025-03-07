const fs = require("fs");
const path = require("path");
require('dotenv').config();

// Carrega o prefixo a partir do arquivo .env
const PREFIX = process.env.PREFIX || "!";

module.exports = {
    name: "menu",
    execute: async (sock, msg) => {
        const chatId = msg.key.remoteJid;

        // Carrega todos os comandos disponíveis na pasta "commands"
        const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith(".js"));

        // Formata a lista de comandos
        let commandList = commandFiles.map(file => `➤ *${PREFIX}${file.replace(".js", "")}*`).join("\n");

        let menuText = `┏━❰ 🌸 𝗠𝗘𝗡𝗨 𝗗𝗔 𝗧𝗘𝗧𝗢 🌸 ❱━┓
┃
${commandList}
┃
┗━━━━━━━━━━━━━━━┛
💬 *Dica:* Digite ${PREFIX}[comando] para usá-lo!`;

        await sock.sendMessage(chatId, { text: menuText }, { quoted: msg });
    }
};
