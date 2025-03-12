const fs = require("fs");
const path = require("path");
require('dotenv').config();

// Carrega o prefixo a partir do arquivo .env
const PREFIX = process.env.PREFIX || "!";

// Função para obter os comandos, sem incluir as pastas no nome
function getCommands(dir, prefix = "") {
    let commands = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Se for uma pasta, percorre as subpastas
            commands.push(...getCommands(fullPath, "")); // Remover prefixo da subpasta
        } else if (file.endsWith(".js")) {
            // Adiciona o comando com o prefixo, mas sem a parte da subpasta
            const commandName = file.replace(".js", "");
            commands.push(`${PREFIX}${commandName}`);
        }
    });
    return commands;
}

module.exports = {
    name: "menu",
    execute: async (sock, msg) => {
        const chatId = msg.key.remoteJid;
        const commandsDir = path.join(__dirname, "../commands");
        const commandList = getCommands(commandsDir).map(cmd => `➤ *${cmd}*`).join("\n");

        let menuText = `┏━❰ 🌸 𝗠𝗘𝗡𝗨 𝗗𝗔 𝗧𝗘𝗧𝗢 🌸 ❱━┓
┃
${commandList}
┃
┗━━━━━━━━━━━━━━━┛
💬 *Dica:* Digite ${PREFIX}[comando] para usá-lo!`;

        await sock.sendMessage(chatId, { text: menuText }, { quoted: msg });
    }
};
