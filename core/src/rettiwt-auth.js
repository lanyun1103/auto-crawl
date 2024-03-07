import { Rettiwt } from 'rettiwt-api';
// Creating a new Rettiwt instance
var rettiwt = new Rettiwt({
    proxyUrl: new URL('http://127.0.0.1:7890')
});
// Logging in an getting the API_KEY
rettiwt.auth.login('<youremail>', '<yourusername>', '<yourpassword>')
    .then(function (apiKey) {
    // Use the API_KEY
    console.log(apiKey);
})
    .catch(function (err) {
    console.log(err);
});
