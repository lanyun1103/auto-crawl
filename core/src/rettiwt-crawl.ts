// @ts-ignore
import {Rettiwt} from 'rettiwt-api';
import config from "./config";

// Creating a new Rettiwt instance using the API_KEY

const rettiwt = new Rettiwt({
    apiKey: config?.API_KEY,
    proxyUrl: new URL('http://127.0.0.1:7890')
});

rettiwt.user.details('')
    .then((details: any) => {
        console.log(details)
    })
    .catch((error: any) => {
        console.error(error)
    });
