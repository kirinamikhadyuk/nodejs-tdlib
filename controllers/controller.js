const {Client} = require('tdl');
const {TDLib} = require('tdl-tdlib-addon');
const utils = require('../utils/utils');

let client;

let isClientConnected = false;

module.exports = {
    getChats: async function (request) {
        if (!isClientConnected) {
            isClientConnected = true;
            await connectClient(request.body.apiId, request.body.apiHash, request.body.phone);
        }

        return await client.invoke({
            _: 'getChats',
            chat_list: {_: 'chatListMain'},
            limit: 50
        });
    },
    sendFile: async function(request) {
        if (!isClientConnected) {
            isClientConnected = true;
            await connectClient(request.body.apiId, request.body.apiHash, request.body.phone);
        }

        const filePath = utils.decodeFromBase64(request.body.file, request.body.fileName);

        await client.invoke({
            _: 'sendMessage',
            chat_id: request.body.chatId,
            input_message_content: {
                _: 'inputMessageDocument',
                document: {
                    _: 'inputFileLocal',
                    path: filePath
                }
            }
        });

        let remoteId, messageId;
        do {
            const messageHistory = await client.invoke({
                _: 'getChatHistory',
                chat_id: request.body.chatId,
                from_message_id: 0,
                limit: 1
            });

            remoteId = messageHistory.messages[0].content.document.document.remote.id;
            messageId = messageHistory.messages[0].id;

            await timer(10000);
        } while (!remoteId);

        utils.deleteFile(filePath);

        return {
            fileId: remoteId,
            messageId: messageId
        };
    },
    getFile: async function (request) {
        if (!isClientConnected) {
            isClientConnected = true;
            await connectClient(request.body.apiId, request.body.apiHash, request.body.phone);
        }

        const remote = await client.invoke({
            _: 'getRemoteFile',
            remote_file_id: request.body.fileId,
        });

        let path;
        do {
            const file = await client.invoke({
                _: 'downloadFile',
                file_id: remote.id,
                priority: 1
            });

            path = file.local.path;

            await timer(3000);
        } while (!path)

        const base64String = await utils.encodeToBase64(path);

        utils.deleteFile(path);

        return base64String;
    },
    deleteFile: async function(request) {
        if (!isClientConnected) {
            isClientConnected = true;
            await connectClient(request.body.apiId, request.body.apiHash, request.body.phone);
        }

        const listToDelete = request.body.messagesId.split(', ');

        await client.invoke({
            _: 'deleteMessages',
            chat_id: request.body.chatId,
            message_ids: listToDelete
        });
    }
}

const timer = ms => new Promise(res => setTimeout(res, ms));

async function connectClient(apiId, apiHash, phone) {
    client = new Client(new TDLib(), {
        apiId: apiId,
        apiHash: apiHash
    });

    await client.connect();
    await client.login(() => ({
        getPhoneNumber: retry => retry ? Promise.reject('Invalid phone number') : Promise.resolve(phone)
    }));
}
