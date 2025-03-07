const fs = require("fs");
const path = require("path");

module.exports = {
    // Função para tratar a chegada das mensagens e verificar comandos
    async onMessage(sock, msg, PREFIX) {
        const chatId = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!text || !text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).split(" ");
        const commandName = args.shift().toLowerCase();

        console.log(`Comando recebido de ${chatId}: ${text}`);
        console.log(`Executando comando: ${commandName}`);

        // Verifica se o comando existe
        const commandPath = path.join(__dirname, 'commands', `${commandName}.js`);
        if (fs.existsSync(commandPath)) {
            // Se o comando existir, executa
            const { handleMessage } = require("./handlers");
            await handleMessage(sock, msg, commandName, args);
        } else {
            // Comando inválido
            const responseText = `❌ Esse comando não existe!! ❌\nVerifique se digitou corretamente ou tente "${PREFIX}menu" para ver todos os comandos disponíveis.`;
            await sock.sendMessage(chatId, { text: responseText }, { quoted: msg });
        }
    }
};
