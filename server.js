const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;


mongo.connect('mongodb://localhost:27017/chatapp', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    
    client.on('connection', function(socket){
        let chat = db.collection('chat');

        
        sendStatus = function(s){
            socket.emit('status', s);
        }

        
        chat.find().limit(200).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            socket.emit('output', res);
        });

       
        socket.on('input', function(data){
            let name = data.name;
            let email = data.email;
            let message = data.message;

         
            if(name == '' || email == '' || message == ''){
                
                sendStatus('Please enter a name, email and message');
            } else {
               
                chat.insert({name: name, email: email, message: message}, function(){
                    client.emit('output', [data]);

                    
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        
        socket.on('clear', function(data){
            
            chat.remove({}, function(){
               
                socket.emit('cleared');
            });
        });
    });
});