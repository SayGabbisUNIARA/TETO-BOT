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

        // Verifica se o comando existe, incluindo nas subpastas
        const commandPath = findCommandPath(commandName, path.join(__dirname, 'commands'));
        if (commandPath) {
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

// Função para procurar o comando em subpastas
function findCommandPath(commandName, dirPath) {
    // Lê todos os arquivos na pasta
    const files = fs.readdirSync(dirPath);

    // Percorre todos os arquivos e subpastas
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Se for uma subpasta, faz a busca recursivamente
            const result = findCommandPath(commandName, filePath);
            if (result) return result;
        } else if (file === `${commandName}.js`) {
            // Se o arquivo correspondente ao comando for encontrado, retorna o caminho
            return filePath;
        }
    }

    return null; // Retorna null se o comando não for encontrado
}
