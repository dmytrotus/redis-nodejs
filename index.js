const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

///play with code page
/*app.get('/:name', (req, res) => {
  res.send(myHelloPage(req.params.name));
})
function myHelloPage(name){
	return `Імя ${name} є найкращим`;
}*/

//initial page
app.get('/', (req,res) => {
	res.send('Hello world');
});

//make request to Github to data
async function getRepos(req, res, next) {
	try{
		console.log('Fetching Data...');
		const { username } = req.params;
		const response = await fetch(`https://api.github.com/users/${username}`);
		const data = await response.json();
		const repos = data.public_repos;
		//res.send(data);
		//set data to redis
		client.setex(username, 3600, repos);
		res.send(setResponse(username, repos));
	} catch(err) {
		console.error(err);
		res.status(500);
	}
}
//set reponse
function setResponse(username, repos){
	return `<h3>Юзер ${username} має ${repos} репозиторіїв на Github</h3>`
}

app.get('/repos/:username', getRepos);

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});

