import express from "express";

import { networkInterfaces } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import cors from 'cors';
import { ExpressPeerServer } from "peer";
import http from 'http'
import https from 'https';
import fs from 'fs';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const apath = path.join(__dirname,'/dist/index.html')
const adir = path.join(__dirname,'/dist');


app.use(cors({
    allowedHeaders : '*',
    methods : '*',
    origin : '*'
}));

app.use(express.static(adir));

app.get('/',(req,res)=>{
    console.log(apath);

    //res.send("hi")
    res.sendFile(apath);
})


console.log(__dirname);


const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

console.log(results);
const port = 8765;
console.log('localhost',port);

const key = fs.readFileSync(path.join(__dirname,'example.com.key'));
const cert = fs.readFileSync(path.join(__dirname,'example.com.crt'));

//const server = app.listen(port);
const server = https.createServer({
    key : key,
    cert : cert
},app)

const peer = ExpressPeerServer(server,{
    debug : true,
    path : '/',
} )

app.use('/peer',peer);

server.listen(port);

