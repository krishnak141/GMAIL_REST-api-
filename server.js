const express=require('express');
const request=require('request');
const https=require('https');
const path=require('path');
const fs=require('fs');
const axios = require('axios');
const app=express()


const file_name = 'file_name.txt';
const file_name1 = 'file_name1.json';
const credentials = 'credentials.json';

const open = require('open');


app.get('/verify-credential',(req,res)=>{
    // opens the url in the default browser 
    var data1 = '';
    fs.readFile(credentials, 'utf8', function(err, data){ 
      
        data1=JSON.parse(data);
        // Display the file content  
    }); 
    let urler = "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/gmail.send&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http://localhost:4000/oauthcallback&client_id=" + data1.client_id
    open(urler);
})

app.get('/oauthcallback',(req,res)=>{
    console.log(req.query.code);
    fs.writeFile(file_name, req.query.code, function (err) {
        if (err) throw err;
        console.log('Replaced!');
      }); 
})

app.get('/access_token',(req,res) =>{
    var data1 = '';
    var data2 = '';
    // Use fs.readFile() method to read the file 
    fs.readFile(file_name, 'utf8', function(err, data){ 
        
        data1=data
        // Display the file content  
    }); 
    
    fs.readFile(credentials, 'utf8', function(err, data){ 
      
        data2=JSON.parse(data);
        // Display the file content  
    }); 
    
    var data = JSON.stringify({
        code: data1,
        client_id: data2.client_id,
        client_secret: data2.client_secret,
        redirect_uri:'http://localhost:4000/oauthcallback',
        grant_type:'authorization_code'
    });

    var options = {
        host: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Content-Length': data.length
        }
    };

    const req1 = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', (d) => {    
            process.stdout.write(d)
            fs.writeFile(file_name1, d, function (err) {
                if (err) throw err;
                console.log('Got it');
            });
        })
    });

      req1.on('error', (error) => {
        console.error(error)
      })
      
      req1.write(data)
      req1.end()

})

app.get('/send_email',(req,res)=>{
    console.log(req.query.code);
    fs.writeFile(file_name, req.query.code, function (err) {
        if (err) throw err;
        console.log('Replaced!');
      }); 
})

app.post('/composeMail', async (req, res, next) => {
    var data1 = '';
    fs.readFile(file_name1, 'utf8', function(err, data){ 
      
        data1=JSON.parse(data);
        // Display the file content  
    }); 

    function makeBody(to, from, subject, message) {
        let str = [
            "to: ", to, "\n",
            "from: ", from, "\n",
            "subject: ", subject, "\n\n",
            message,
        ].join('');
        return str;
    }
    let raw = makeBody("freshmax17@gmail.com", "freshmax17@gmail.com", "Test mail", "Everything is fine");
    // let obj = {};
    // obj.raw = raw;
    // let body = JSON.stringify(obj);
    // const userId = 'me'; // Please modify this for your situation.
    let options = {
        url: "https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send",
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${data1.access_token}`,
            'Content-Type': 'message/rfc822',
        },
        body: raw,
    };

    // await request(option);
    // .then(body => {
    //     return res.apiOk(body);
    // }).catch(err => {
    //     return res.apiError(err);
    // })
    const req1 = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', (d) => {    
            process.stdout.write(d);
        })
    });

      req1.on('error', (error) => {
        console.error(error)
      })
      
      req1.write(raw);
      req1.end()
});

app.listen(4000, ()=>{
    console.log('app is listening on port 4000')
})

