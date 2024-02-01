import {Rettiwt} from 'rettiwt-api';

// Creating a new Rettiwt instance
const rettiwt = new Rettiwt({
    proxyUrl: new URL('http://127.0.0.1:7890')
});

// Logging in an getting the API_KEY
rettiwt.auth.login('<youremail>', '<yourusername>', '<yourpassword>')
    .then(apiKey => {
        // Use the API_KEY
        console.log(apiKey);
    })
    .catch(err => {
        console.log(err);
    });