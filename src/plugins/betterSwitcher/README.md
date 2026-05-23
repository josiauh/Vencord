# BetterSwitcher
An extension of Discord's search bar, and

## Features
* You can favorite messages and search through them here!
* Fuzzy finding and regex search
* Extra filters!

## How do I use it?
Search stuff

To favorite stuff, the Context Menu has a Favorite Message button

## Filters
Some of the filters documented [here](https://docs.discord.food/resources/message#query-string-params) are implemented.

* `not!<filter>`: Search everything but `filter`
* `is:<query>`: Extra things to search for, each category will have their own "is" queries

### Messages
* `is:reply`: Author is replying to a message (this includes forwarding, at least for now)
* `reaction:<emojiName/emojiId>`: Messages with a certain reaction
* `is:spawnThread`: Messages that make a thread
* `is:edited`: Has an edit

### Users/Friends
* `is:pending`: You have a friend request to, or they're friend requesting you
* `is:ghosted`: Haven't talked to this friend for at least 1 week/configured time (servers that you are new in do not count)
* `has:note`: Noted on

### Channels
* `is:readOnly`: Can't talk in these channels
* `is:hidden`: Show channels you have no access to at all
* `is:<type>`: The channel is type, type being forum, voice, text, stage, or thread
* `is:privileged`: Do you have high permissions here?

### Servers
* `folder:<name>`: What folder the server is in
* `is:readOnly`: No channels are available for you to speak in for that server
* `is:ghosted`: See the Users/Friends
* `is:boosted`: Have you boosted the server?
* `is:admin`: Do you have administrator permission server-wide?

<!-- is:🤼‍♀️: Jamie Paige -->
