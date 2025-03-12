const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'kiss',
    description: 'Envia um beijo para o usuário mencionado.',
    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const sender = msg.pushName || 'Alguém';
        let mentioned = '';

        // Verifica se há menção na mensagem
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (args.length > 0) {
            mentioned = args.join(' ');
        } else {
            await sock.sendMessage(chatId, { text: 'Você precisa mencionar alguém para enviar um beijo!' });
            return;
        }

        // Busca um GIF de beijo na GIPHY
        const apiKey = process.env.GIPHY_API_KEY;
        if (!apiKey) {
            console.error('Erro: GIPHY_API_KEY não definida no .env');
            await sock.sendMessage(chatId, { text: 'Erro interno: chave de API não configurada.' });
            return;
        }

        const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=anime kiss&limit=5&rating=G&lang=pt`;

        try {
            const response = await axios.get(url);
            const gifs = response.data.data;

            if (!gifs.length) {
                await sock.sendMessage(chatId, { text: 'Não consegui encontrar um GIF de beijo no momento.' });
                return;
            }

            // Escolhe um GIF aleatório entre os retornados
            const gifUrl = gifs[Math.floor(Math.random() * gifs.length)].images.original.url;

            // Baixar o GIF para o servidor
            const gifPath = path.join(__dirname, 'kiss.gif'); // Caminho local onde o GIF será salvo
            const writer = fs.createWriteStream(gifPath);
            const responseGif = await axios.get(gifUrl, { responseType: 'stream' });
            responseGif.data.pipe(writer);

            writer.on('finish', async () => {
                // Envia o arquivo GIF como vídeo para garantir que será tratado como animação
                const message = {
                    video: { url: gifPath },
                    caption: `*${sender}* deu um beijão em *${mentioned}*!! 💖`,
                    gifPlayback: true,  // Garantindo que o GIF seja reproduzido
                };

                await sock.sendMessage(chatId, message);

                // Após o envio, exclua o GIF local para não acumular arquivos
                fs.unlinkSync(gifPath);
            });

            writer.on('error', (error) => {
                console.error('Erro ao salvar o GIF:', error);
                sock.sendMessage(chatId, { text: 'Ocorreu um erro ao tentar enviar o beijo.' });
            });
        } catch (error) {
            console.error('Erro ao buscar ou enviar GIF:', error);
            await sock.sendMessage(chatId, { text: 'Ocorreu um erro ao tentar enviar o beijo.' });
        }
    },
};
