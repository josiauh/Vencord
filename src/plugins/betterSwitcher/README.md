# BetterSwitcher
An extension of Discord's search bar and quick finder!

## How do I use it?
It's a search modal, to activate it use `Ctrl+Y`.

## Filters
Some of the filters documented [here](https://docs.discord.food/resources/message#query-string-params) are implemented.
Filter values can use double quotes to include spaces.

* [x] `not!<filter>`: Search everything but `filter`
* [x] `is:<query>`: Extra things to search for, each category will have their own "is" queries
* [ ] `is:favorite`: An object you have favorited. You can favorite something in a context menu.

### Messages

Note: if you are using All Messages, that hits the Discord API, which is limited to 25 messages per result. Use the `offset` filter (from the docs):
* `offset:<number>`: Number to offset the returned messages by (max 9975)

* [x] `is:reply`: Author is replying to a message (this includes forwarding, at least for now)
* [x] `reaction:<emojiName/emojiId>`: Messages with a certain reaction
* [x] `is:spawnThread`: Messages that make a thread
* [x] `is:edited`: Has an edit

### Users/Friends
* [x] `is:pending`: You have a friend request to, or they're friend requesting you
* [ ] `is:ghosted`: Haven't talked to this friend for at least 1 week/configured time. You must configure the ghosting option first.
* [ ] `has:note`: Noted on

### Channels
* [ ] `is:readOnly`: Can't talk in these channels
* [ ] `is:hidden`: Show channels you have no access to at all
* [ ] `is:<type>`: The channel is type, type being forum, voice, text, stage, or thread

### Servers
* [x] `folder:<name>`: What folder the server is in
* [x] `folder:noFolder`: All the unsorted servers
* [x] `is:readOnly`: No channels are available for you to speak in for that server
* [ ] `is:ghosted`: See the Users/Friends entry
* [x] `is:boosted`: Have you boosted the server?
* [x] `is:mod`: Are you able to do basic moderation in this server all around? (Delete messages, kick members, pin messages, bypass slowmodes)
* [x] `is:admin`: Do you have administrator permission server-wide?

<!-- is:🤼‍♀️: Jamie Paige -->

## Cached Messages vs. All Messages
Cached Messages for more speed and results, All Messages for older messages and accurate filters
