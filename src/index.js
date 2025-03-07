require('dotenv').config();
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

const PREFIX = process.env.PREFIX || "!"; // Usa o prefixo do .env ou "!" por padrão

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("Escaneie o QR Code para conectar:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log("Conexão fechada. Código:", reason);

            if (reason === DisconnectReason.loggedOut) {
                console.log("Você foi desconectado. Exclua 'auth_info' e escaneie um novo QR Code.");
                process.exit(0);
            } else {
                console.log("Tentando reconectar...");
                startBot();
            }
        } else if (connection === 'open') {
            console.log("Bot conectado com sucesso!");
        }
    });

    sock.ev.on('messages.upsert', async (messages) => {
        const msg = messages.messages[0];
        if (!msg || !msg.message) return;

        const chatId = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!text || !text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).split(" ");
        const commandName = args.shift().toLowerCase();

        console.log(`Comando recebido de ${chatId}: ${text}`);
        console.log(`Executando comando: ${commandName}`);

        const { handleMessage } = require("./handlers");
        await handleMessage(sock, msg, commandName, args);
    });
}

startBot();
