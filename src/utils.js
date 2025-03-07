function getMentionedText(text) {
    return text.replace(/@\S+/g, "").trim();
}

module.exports = { getMentionedText };
