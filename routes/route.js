const controller = require('../controllers/controller');

const router = app => {
    app.get('/getChats', (request, response) => {
        controller.getChats(request).then(result => {
            response.send({
                chats: result
            });
        })
    });

    app.get('/getFile', (request, response) => {
        controller.getFile(request).then(result => {
            response.send({
                encodedFile: result
            });
        })
    });

    app.post('/sendFile', (request, response) => {
       controller.sendFile(request).then(result => {
           response.send({
              response: result
           });
       })
    });

    app.get('/deleteFile', (request, response) => {
        controller.deleteFile(request).then(() => {
           response.send({
               response: 'File successfully deleted'
           })
        });
    });
}

module.exports = router;
