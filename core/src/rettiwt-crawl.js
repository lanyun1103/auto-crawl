// @ts-ignore
import { Rettiwt } from 'rettiwt-api';
import config from "./config";
// Creating a new Rettiwt instance using the API_KEY
var rettiwt = new Rettiwt({
    apiKey: config === null || config === void 0 ? void 0 : config.API_KEY,
    proxyUrl: new URL('http://127.0.0.1:7890')
});
/**
 * Fetching the list of tweets that:
 *    - are made by a user with username <username>,
 *    - contain the words <word1> and <word2>
 */
rettiwt.user.details('')
    .then(function (details) {
    console.log(details);
})
    .catch(function (error) {
    console.error(error);
});
