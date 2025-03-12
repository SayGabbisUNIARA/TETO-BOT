const fs = require("fs");
const path = require("path");

const commands = {};

// Função recursiva para carregar comandos de subpastas
function loadCommands(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            loadCommands(fullPath); // Se for uma pasta, carrega os comandos dentro dela
        } else if (file.endsWith(".js")) {
            const commandName = file.replace(".js", "");
            commands[commandName] = require(fullPath);
        }
    });
}

// Caminho correto para a pasta commands
const commandsPath = path.join(__dirname, "commands");
loadCommands(commandsPath);

async function handleMessage(sock, msg, commandName, args) {
    if (commands[commandName]) {
        try {
            await commands[commandName].execute(sock, msg, args);
        } catch (error) {
            console.error(`Erro ao executar o comando ${commandName}:`, error);
        }
    }
}

module.exports = { handleMessage };
