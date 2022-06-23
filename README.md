# be8-backend

Server for the be8 messenger.

# Routes

## accs

Handling for the be8 acc object:

```javascript
{
    nickname: 'picked name or randomly generated name',
    password: 'randomly generated pw',
    type: 'user',
    expire: 'Date object', // acc expires after 30 days
    id: 'generated acc id'
}
```

### /newacc

```javascript
const body = {
    nickname: 'picked name or randomly generated name',
    password: 'randomly generated',
};

fetch('/newacc', {
    method: 'POST',
    body,
});
```

### /me

Returns the acc (without password) of the actual session.

```javascript
fetch('/me', {
    method: 'GET',
});
```

### /changenickname

User can change his nick every time and as often as he wants to.

```javascript
const body = {
    newNickname: 'picked new name',
    oldNickname: 'former name',
};

fetch('/changenickname', {
    method: 'POST',
    body,
});
```

### /destroyacc

Deletes the acc of the actual session and all conversations of the acc. If acc is a group admin, the group will be deleted too.

```javascript
fetch('/destroyacc', {
    method: 'GET',
});
```

## conversations

Handles threads and messages.

### /getthreads

Fetches all threads for the acc of the actual session and creates a master thread for system messages. A threadID is always a compound of the two conversation partners, e.g. 10281:10317, 10281:g123 (for groups).

```javascript
fetch('/getthreads', {
    method: 'GET',
});
```

returns thread object:

```javascript
[{
    // masterthread. Expire is set to future for sorting
    expire: '2286-11-20T17:46:40.000Z'
    nickname: 'be8'
    sender: 's1' // system acc
    status: 'read' // unread
    text: 'ACCDELETED' // text of last message
    threadID: '10326:s1'
    ts: 'time of last message'
    type: 'system' // user
}, {
    ...
}]
```

### /getmessages

Fetches all messages of a conversation but returns only the last 100. A messageID is always an iterating number in the thread. For storing it into the db the threadID is compound with the messageID, e.g. 10281:10317:7.

```javascript
const body = {
    threadID: 'some thread id',
};

fetch('/getmessages', {
    method: 'POST',
    body,
});
```

returns message object:

```javascript
[{
    messageID: "4"
    nickname: "fancy name"
    receiver: "10317"
    sender: "10281"
    status: ["10317"] // ids that already have seen the messages
    text: "OrIXGw8CR6TYin5f2XNTuFpurMoPo7SgVtL3AKx" // text is always encrypted
    threadID: "10281:10317"
    ts: "Wed Jun 22 2022 11:08:35 GMT+0000 (Coordinated Universal Time)"
    type: "textMessage" // system, imageMessage
}, {
    ...
}]
```

### /startconversation

When starting a conversation the threadID and a system message for both conversation partner in the thread is getting generated.

```javascript
const body = {
    receiverID: 'some id',
};

fetch('/startconversation', {
    method: 'POST',
    body,
});
```

### /writemessage

When writing a message your conversation partner, or everyone in a group you are writing to, is getting a pushnotification.

```javascript
const body = {
    nickname: "fancy dude"
    receiver: "10317"
    sender: "10281"
    text: "lbpyj3HzcX4v3WbNMka90X7XJRCmrw=="
    threadID: "10281:10317"
    type: "textMessage"
};

fetch('/writemessage', {
    method: 'POST',
    body
});
```
