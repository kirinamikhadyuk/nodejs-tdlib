const fs = require('fs');

module.exports = {
    encodeToBase64: function (path) {
        let buff = fs.readFileSync(path);
        return buff.toString('base64');
    },
    decodeFromBase64: async function (base64String, fileName) {
        const filePath = __dirname + '/files/' + fileName;
        let buff = new Buffer(base64String, 'base64');
        await fs.writeFileSync(filePath, buff);

        return filePath;
    },
    deleteFile: function (path) {
        fs.unlinkSync(path);
    }
}
