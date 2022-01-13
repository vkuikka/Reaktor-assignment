function	stringify_timestamp(timestamp) {
	let date = new Date(timestamp);
	const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
	const [hour, minutes] = [('0' + date.getHours()).substr(-2),
							('0' + date.getMinutes()).substr(-2)];
	return (day + '/' + month + '/' + year + ' ' + hour + ':' + minutes);
}

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

// Make html element for game result
function	format_game(value, played_hands, result_totals) {
	let		pA = value.playerA.played;
	let		pB = value.playerB.played;
	let		game_html;

	game_html = '<span timestamp=' + value.t + ' class="date">' + stringify_timestamp(value.t) + '</span>';
	game_html += '<span class="match_result">';
	played_hands[pA] += 1;
	if ((pA == 'PAPER' && pB == 'ROCK') || (pA == 'ROCK' && pB == 'SCISSORS') || (pA == 'SCISSORS' && pB == 'PAPER')) {
		result_totals['win'] += 1;
		game_html += '<span class="winner">' + value.playerA.name + '</span>' + ' vs '
					+ '<span class="loser">' + value.playerB.name + '</span>';
	}
	else if ((pA == 'PAPER' && pB == 'SCISSORS') || (pA == 'ROCK' && pB == 'PAPER') || (pA == 'SCISSORS' && pB == 'ROCK')) {
		result_totals['loss'] += 1;
		game_html += '<span class="loser">' + value.playerA.name + '</span>' + ' vs '
					+ '<span class="winner">' + value.playerB.name + '</span>';
	}
	else {
		result_totals['draw'] += 1;
		game_html += '<span class="draw">' + value.playerA.name + '</span>' + ' vs '
					+ '<span class="draw">' + value.playerB.name + '</span>';
	}
	return (game_html + '</span>' + '<br>');
}

// update game history stats with new data
function	update_stats(played_hands, result_totals) {
	let total_played = played_hands['PAPER'] + played_hands['ROCK'] + played_hands['SCISSORS'];
	let	totals_element = document.getElementById('totals');
	let	filtered_element = document.getElementById('filtered_player_stats');
	let	percentages = {
		'win': Math.round(result_totals['win'] / total_played * 100),
		'loss': Math.round(result_totals['loss'] / total_played * 100),
		'draw': Math.round(result_totals['draw'] / total_played * 100),
		'paper': Math.round(played_hands['PAPER'] / total_played * 100),
		'rock': Math.round(played_hands['ROCK'] / total_played * 100),
		'scissors': Math.round(played_hands['SCISSORS'] / total_played * 100),
	}

	totals_element.innerHTML = '';
	if (total_played > 5000)
		totals_element.innerHTML = 'total games: ' + total_played + '<br>';
	totals_element.innerHTML += 'most played hand:';
	if (played_hands['ROCK'] >= played_hands['PAPER'] && played_hands['ROCK'] >= played_hands['SCISSORS'])
		totals_element.innerHTML += ' ROCK,';
	if (played_hands['PAPER'] >= played_hands['ROCK'] && played_hands['PAPER'] >= played_hands['SCISSORS'])
		totals_element.innerHTML += ' PAPER,';
	if (played_hands['SCISSORS'] >= played_hands['PAPER'] && played_hands['SCISSORS'] >= played_hands['ROCK'])
		totals_element.innerHTML += ' SCISSORS,';
	totals_element.innerHTML = totals_element.innerHTML.slice(0, -1) + '<br>';

	if (filter != '') {
		filtered_element.innerHTML = '<br>Filtered stats:<br>' +
			'Win: ' + percentages['win']  + '%<br>' + 
			'Loss: ' + percentages['loss'] + '%<br>' + 
			'Draw: ' + percentages['draw'] + '%';
	}
	else
		filtered_element.innerHTML = '';
	document.getElementById('ratios').innerHTML =
		'Paper: ' + percentages['paper'] + '%<br>' +
		'Rock: ' + percentages['rock'] + '%<br>' +
		'Scissors: ' + percentages['scissors'] + '%';
}

// update whole history tab including stats
function	update_history(all_history, filter) {
	let	result = [];
	let	played_hands = {'PAPER': 0, 'ROCK': 0, 'SCISSORS': 0};
	let	result_totals = {'win': 0, 'loss': 0, 'draw': 0};

	for (const [_, value] of Object.entries(all_history)) {
		if (filter) {
			include_A = (value.playerA.name.toLowerCase().includes(filter.toLowerCase()));
			include_B = (value.playerB.name.toLowerCase().includes(filter.toLowerCase()));

			//	swap players so filtered player is on left in resulting table
			if (!include_A && include_B)
				[value.playerA, value.playerB] = [value.playerB, value.playerA];
			else if (!include_A)
				continue;
		}
		result.push(format_game(value, played_hands, result_totals));
	}
	result = result.sort().reverse().join('');
	update_stats(played_hands, result_totals);
	return (result);
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
