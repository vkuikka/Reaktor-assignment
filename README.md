# Reaktor-assignment

Web application that displays rock-paper-scissors match results supplied by two API endpoints.

<img src="/media/demo.gif"/>

### Features
- Write something in search box to filter names in the history list.
- Click checkbox to start loading more data from the API. Don't leave running for too long the data is seemingly infinite. ("The historical results must include ***all*** games that a player has played")
- Click load more to load one page of data from the API.
- Stats about the filtered player(s) is listed when a filter is applied.

### Notes
The data is not perfectly ordered when it comes from the API so when you load more data it can be newer than some of the data that is listed in history.

### Try it
Host it for yourself for example using PHP built-in webserver:   
- Run ```sudo php -S 127.0.0.1:80``` from your cloned repository directory (or specify root with ```-t``` flag).
- Go to ```127.0.0.1``` on your web browser.

Tested on macOS 12.1
