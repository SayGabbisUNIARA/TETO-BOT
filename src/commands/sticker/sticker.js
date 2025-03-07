const { writeFile } = require("fs/promises");
const { exec } = require("child_process");

async function sticker(sock, msg) {
    if (!msg.message.imageMessage) {
        return sock.sendMessage(msg.key.remoteJid, { text: "Envie uma imagem com o comando !sticker" });
    }

    const buffer = await sock.downloadMediaMessage(msg);
    const filePath = `temp-${Date.now()}.jpg`;

    await writeFile(filePath, buffer);
    exec(`convert ${filePath} -resize 512x512 temp.webp`, async (err) => {
        if (err) return sock.sendMessage(msg.key.remoteJid, { text: "Erro ao criar figurinha!" });

        const stickerBuffer = await fs.promises.readFile("temp.webp");
        await sock.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer });
    });
}

module.exports = { sticker };
