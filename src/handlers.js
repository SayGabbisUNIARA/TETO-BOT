const fs = require("fs");
const path = require("path");

const commands = {};
fs.readdirSync(path.join(__dirname, "commands")).forEach(file => {
    if (file.endsWith(".js")) {
        const commandName = file.replace(".js", "");
        commands[commandName] = require(`./commands/${file}`);
    }
});

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
