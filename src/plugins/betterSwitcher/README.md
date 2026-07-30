# BetterSwitcher

An extension of Discord's search bar and quick finder! Open it with `Ctrl+Y`.

## Filters

Some of the filters documented [in the discord userdocs](https://docs.discord.food/resources/message#query-string-params) are implemented.
Filter values can use double quotes to include spaces.

* [x] `not!<filter>`: Search everything but `filter`
* [x] `is:<query>`: Extra things to search for, each category will have their own "is" queries
* [ ] `is:favorite`: An object you have favorited. You can favorite something in a context menu.

### Messages

Note: if you are using All Messages, that hits the Discord API, which is limited to 25 messages per result. Use the `offset` filter (from the docs):

* `offset:<number>` (max 9975)

* [x] `is:reply`
* [x] `reaction:<emojiName/emojiId>`
* [x] `is:spawnThread`: Messages that make a thread
* [x] `is:edited`

### Users

* [x] `is:pending`: Friend request sent?
* [x] `is:friend`
* [x] `is:suggested`: Suggested friends (see the [article on suggested friends](https://support.discord.com/hc/en-us/articles/360061878534-Find-Your-Friends-FAQ))
* [x] `is:implicit` (see the ImplicitRelationships plugin for detail)
* [x] `is:ghosted`: Haven't messaged for at least 1 week/configured time. (must be tracked in settings)

### Channels

* [x] `is:readOnly`: Can't talk in these channels
* [ ] `is:hidden`: Channels you don't normally see
* [ ] `is:<type>`: The channel is type, type being forum, voice, text, stage, or thread

### Servers

* [x] `folder:<name>`: What folder the server is in
* [x] `folder:noFolder`: All the unsorted servers
* [x] `is:readOnly`
* [x] `is:ghosted`
* [x] `is:boosted`
* [x] `is:mod`: Are you able to do basic moderation in this server?
* [x] `is:admin`

## Limitations

* Cached Messages is cached and cannot go older. Its faster though
* Guild Members have the same limitation of being cached with no way to search all.
* The reimplementation of `mentions` ONLY supports snowflakes or cached guild members.
