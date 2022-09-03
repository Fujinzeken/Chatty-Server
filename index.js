const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose')
const Message = require('./model/messages')
const http = require('http');
const {Server} = require('socket.io');
const app = express()


app.use(cors()); //add cors middleware

const server = http.createServer(app);
mongoose.connect(process.env.MONGO_URL).then(
    ()=>{
        console.log('DB Connected successfully')}).catch((err)=>{console.log(err)})
    
// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
    cors:{
        origin:'http://localhost:3000',
        methods:['GET', 'POST'],
    },
});

const CHAT_BOT = 'ChatBot' // create chatBot

let chatRoomTopic = ''
let allUsers = []


// listen for when the client connects via Socket.io-client 
io.on('connection', (socket)=>{
    console.log(`User Connected ${socket.id}`);

    // add user to a topic
    socket.on('get_in', (data)=>{
        const {username, topic} = data //this data was sent from the client side when user joined topic in home
        socket.join(topic) //join user to socket topic room

            let createdTime = Date.now()
        // send message to all users currently in the topic room, asides from user that just joined
        socket.to(topic).emit('recieve_message', {
            message:`${username} has joined the chat room`,
            username: CHAT_BOT,
            createdTime
        });

        // send message to user who just joined
        socket.emit('recieve_message', {
            message:`Welcome ${username}`,
            username:CHAT_BOT,
            createdTime
        });
        
        
        chatRoomTopic = topic
        allUsers.push({id:socket.id, username, topic});
        chatRoomUsers = allUsers.filter((user)=>user.topic === topic);
        socket.to(topic).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers)

        // show last 100 messages in topic room 
        Message.find(function(err, messages){
        if(err){
            console.log(err)
        }else{
            socket.emit('last_messages', messages)
            console.log(messages)
        }
       })
       
       
    });

    socket.on('send_message', (data)=>{
        const {message, username, topic, createdTime} = data
        io.in(topic).emit('receive_message', data) // send to all users in the topic room, including sender
            try{
            const newMessage = new Message({
                message:message,
                username:username,
                topic:topic,
                createdTime: createdTime
            })
            newMessage.save()
           
        }catch(err){
            console.log(err)
        }
    })
});

server.listen(4000, ()=>{
    'Server is running on port 4000'
});