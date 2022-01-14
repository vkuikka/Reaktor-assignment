import { update_history } from "./game_history.js";

// Load a page, add all loaded games to history table and sort it
function	request_more(ongoing_request, all_history, last_data_id, name_filter) {
	let req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if(req.readyState === 4) {
			if(req.status === 200) {
				const data = JSON.parse(req.responseText);
				const keep_loading = document.getElementById('keep_loading').checked;
				for (const [key, value] of Object.entries(data['data']))
					all_history[value['gameId']] = value;
				document.getElementById('history_results').innerHTML = update_history(all_history, name_filter);
				ongoing_request['cursor'] = data['cursor'];

				// I dont know how data ends
				if (keep_loading && data['cursor'] != '' && data['data'][0]['gameId'] != last_data_id) {
					name_filter = document.getElementById('filter').value;
					request_more(ongoing_request, all_history, data['data'][0]['gameId'], name_filter);
				}
				ongoing_request['done'] = true;
			} else {
				console.log('Error Code: ' + req.status);
				console.log('Error Message: ' + req.statusText);
			}
		}
	}
	req.open('GET', 'http://127.0.0.1/request_history.php', true);
	req.setRequestHeader('cursor', ongoing_request['cursor']);
	req.send();
}

// Check if game has to be removed from ongoing list and add new ongoing games
function update_ongoing(all_ongoing, all_history) {
	let res = '';

	for (const [key, value] of Object.entries(all_ongoing)) {
		if (all_history[key] == undefined)
			res += value.playerA.name + ' vs ' + value.playerB.name + '<br>';
		else
			delete all_ongoing[key];
	}
	return (res);
}

const history_element = document.getElementById('history_results');
const ongoing_element = document.getElementById('ongoing_results');
let all_ongoing = {};
let all_history = {};
let	filter = '';

document.getElementById('filter').onchange = function() {
	filter = this.value;
	history_element.innerHTML = update_history(all_history, filter);
};

// Connect to socket and listen for messages
const socket = new WebSocket('wss://bad-api-assignment.reaktor.com/rps/live');
socket.addEventListener('message', function (event) {
	const data = JSON.parse(JSON.parse(event.data));

	if (data.type == "GAME_RESULT")
	{
		all_history[data.gameId] = data;
		history_element.innerHTML = update_history(all_history, filter);
	}
	else if (data.type == "GAME_BEGIN")
		all_ongoing[data.gameId] = data;
	ongoing_element.innerHTML = update_ongoing(all_ongoing, all_history);
});

// ongoing history load request is saved to prevent async issues when spamming requests
let ongoing_request = {'done': true, 'cursor': '/rps/history', 'all_done' : false};

// request once so game history is not empty when loading page
request_more(ongoing_request, all_history, 0, filter);

// start making requests for game history
document.getElementById('keep_loading').onclick = function() {
	request_more(ongoing_request, all_history, 0, filter);
};

// make one request for game history
document.getElementById('load_more').onclick = function() {
	if (ongoing_request['done'] == true) {
		ongoing_request['done'] = false;
		request_more(ongoing_request, all_history, 0, filter);
	}
};
