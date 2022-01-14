// Takes unix timestamp and returns a string with the date and time
function	stringify_timestamp(timestamp) {
	let date = new Date(timestamp);
	const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
	const [hour, minutes] = [('0' + date.getHours()).substr(-2),
							('0' + date.getMinutes()).substr(-2)];
	return (day + '/' + month + '/' + year + ' ' + hour + ':' + minutes);
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
function	update_stats(played_hands, result_totals, filter) {
	let	totals_element = document.getElementById('totals');
	let	filtered_element = document.getElementById('filtered_player_stats');
	let total_played = played_hands['PAPER'] + played_hands['ROCK'] + played_hands['SCISSORS'];
	let	percentages = {
		'win': Math.round(result_totals['win'] / total_played * 100),
		'loss': Math.round(result_totals['loss'] / total_played * 100),
		'draw': Math.round(result_totals['draw'] / total_played * 100),
		'paper': Math.round(played_hands['PAPER'] / total_played * 100),
		'rock': Math.round(played_hands['ROCK'] / total_played * 100),
		'scissors': Math.round(played_hands['SCISSORS'] / total_played * 100),
	}

	totals_element.innerHTML = 'total games: ' + total_played + '<br>';

	// If there are multiple most played hands with the same amount, show them all.
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

// Update whole history tab including stats
export function	update_history(all_history, filter) {
	let	result = [];
	let	played_hands = {'PAPER': 0, 'ROCK': 0, 'SCISSORS': 0};
	let	result_totals = {'win': 0, 'loss': 0, 'draw': 0};

	for (const [_, value] of Object.entries(all_history)) {
		if (filter) {
			let	include_A = (value.playerA.name.toLowerCase().includes(filter.toLowerCase()));
			let	include_B = (value.playerB.name.toLowerCase().includes(filter.toLowerCase()));

			//	swap players so filtered player is on left in resulting table
			if (!include_A && include_B)
				[value.playerA, value.playerB] = [value.playerB, value.playerA];
			else if (!include_A)
				continue;
		}
		result.push(format_game(value, played_hands, result_totals));
	}
	result = result.sort().reverse().join('');
	update_stats(played_hands, result_totals, filter);
	return (result);
}
