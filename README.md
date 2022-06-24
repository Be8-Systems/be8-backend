# be8-backend

Server for the be8 messenger.

<!-- toc -->

- [accs](#accs)
  * [/newacc](#newacc)
    + [acc object](#acc-object)
  * [/me](#me)
  * [/changenickname](#changenickname)
  * [/destroyacc](#destroyacc)
- [conversations](#conversations)
  * [/getthreads](#getthreads)
    + [thread object](#thread-object)
  * [/getmessages](#getmessages)
    + [message object](#message-object)
  * [/startconversation](#startconversation)
  * [/writemessage](#writemessage)
- [groups](#groups)
  * [/groupcreate](#groupcreate)
    + [group object](#group-object)
  * [/groupaddmember](#groupaddmember)
  * [/groupjoinmember](#groupjoinmember)
  * [/groupgetmembers](#groupgetmembers)
  * [/groupleavemember](#groupleavemember)
  * [/groupkickmember](#groupkickmember)
  * [/groupdestroygroup](#groupdestroygroup)
  * [/groupstorekey](#groupstorekey)
  * [/groupgetkeys](#groupgetkeys)
  * [/groupgetcurrentversion](#groupgetcurrentversion)
  * [/grouptriggersseupdate](#grouptriggersseupdate)
- [inviteLink](#invitelink)
  * [/invitelink](#invitelink)
- [keys](#keys)
  * [/setkey](#setkey)
  * [/getkey](#getkey)
  * [/getkeys](#getkeys)
- [media](#media)
  * [/imageupload](#imageupload)
  * [/imageget](#imageget)
- [utilities](#utilities)
  * [/insights](#insights)
  * [/subscribe](#subscribe)

<!-- tocstop -->

## accs

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

#### acc object

```javascript
{
    nickname: 'picked name or randomly generated name',
    password: 'randomly generated pw',
    type: 'user',
    expire: 'Date object', // acc expires after 30 days
    id: 'generated acc id'
}
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

Deletes the acc of the actual session and all conversations of the acc. If the user is a group admin, the group will be deleted too.

```javascript
fetch('/destroyacc', {
    method: 'GET',
});
```

## conversations

Handles threads and messages.

### /getthreads

Fetches all threads for the acc of the actual session. A threadID is always a compound of the two conversation partners, e.g. 10281:10317, 10281:g123 (for groups).

```javascript
fetch('/getthreads', {
    method: 'GET',
});
```

#### thread object

```javascript
[{
    expire: 'some date',
    nickname: 'nice nick',
    sender: '10281', // system acc
    status: 'read', // unread
    text: 'wkdjf48isjfdskjf92834ied', // text of last message encrypted
    threadID: '10281:10326',
    ts: 'time of last message',
    type: 'user' // system
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

#### message object

```javascript
[{
    messageID: '4',
    nickname: 'fancy name',
    receiver: '10317',
    sender: '10281',
    status: ['10317'], // ids of accs that already have seen the messages
    text: 'OrIXGw8CR6TYin5f2XNTuFpurMoPo7SgVtL3AKx', // text is always encrypted
    threadID: '10281:10317',
    ts: 'Wed Jun 22 2022 11:08:35 GMT+0000 (Coordinated Universal Time)',
    type: 'textMessage', // system, imageMessage
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
    nickname: 'fancy dude'
    receiver: '10317'
    sender: '10281'
    text: 'lbpyj3HzcX4v3WbNMka90X7XJRCmrw=='
    threadID: '10281:10317'
    type: 'textMessage'
};

fetch('/writemessage', {
    method: 'POST',
    body
});
```

## groups

Handles all group activities incl. encrypted group keys. //TODO: private public groups

### /groupcreate

The groupID is always a generated number with a leading 'g'. The creator is automatically the admin and gets a system message for creating the group. There are private and public groups.

```javascript
const body = {
    groupType: 'public', // private
    nickname: 'fancy groupname',
    maxMembers: 100, // optional, default is set to 20
};

fetch('/groupcreate', {
    method: 'POST',
    body,
});
```

#### group object

```javascript
{
    groupID: 'g1234',
    nickname: 'fancy groupname',
    type: 'group',
    groupType: 'public',
    admin: '10317', // creator
    maxMembers: 100,
}
```

### /groupaddmember

In a public group everyone can add another member unless the maxMembers are not reached. In a private group only the admin can add new members.

```javascript
const body = {
    groupID: 'g1234',
    memberID: '10281'
};

fetch('/groupaddmember', {
    method: 'POST',
    body,
});
```

### /groupjoinmember

Acc of actual session got added to a public group by clicking the invite link. If no acc was created before one get's automatically created and added to the group.

```javascript
const body = {
    groupID: 'g1234'
};

fetch('/groupjoinmember', {
    method: 'POST',
    body,
});
```

### /groupgetmembers

Returns all members and the admin always on first position.

```javascript
const body = {
    groupID: 'g1234'
};

fetch('/groupgetmembers', {
    method: 'POST',
    body,
});
```

### /groupleavemember

If someone leaves the group a new groupkey is getting generated. If he rejoins the group he can see the old messages he saw before leaving but not the ones after leaving.

```javascript
const body = {
    accID: '10281',
    groupID: 'g1234'
};

fetch('/groupleavemember', {
    method: 'POST',
    body,
});
```

### /groupkickmember

Only the admin is able to kick a member of a group. The admin cannot kick himself.

```javascript
const body = {
    accID: '10281',
    groupID: 'g1234'
};

fetch('/groupkickmember', {
    method: 'POST',
    body,
});
```

### /groupdestroygroup

When a group get's destroyed it's removed from every member's thread, so no one can read the messages anymore. Only the admin can destroy the group.

```javascript
const body = {
    groupID: 'g1234'
};

fetch('/groupdestroygroup', {
    method: 'POST',
    body,
});
```

### /groupstorekey

Everytime a member leaves the group or is added, a new group key is getting generated and stored encrypted for every member of the group. Also the groupVersion is increased and stored for every member that is still in the group.

```javascript
const body = {
    groupID: 'g1234',
    groupKey: 'encrypted group key',
    accID: '10281',
    keyholder: '10281'
};

fetch('/groupstorekey', {
    method: 'POST',
    body,
});
```

### /groupgetkeys

Only groupKeys are returned for the groupVersion that are stored for the particular acc. Only when the user is part of the group.

```javascript
const body = {
    groupID: 'g1234',
    accID: '10281'
};

fetch('/groupgetkeys', {
    method: 'POST',
    body,
});
```

### /groupgetcurrentversion

When sending a message in a group the current group version is getting fetched for encrypting the message with the dedicated group key.

```javascript
const body = {
    groupID: 'g1234'
};

fetch('/groupgetcurrentversion', {
    method: 'POST',
    body,
});
```

### /grouptriggersseupdate

Trigger server sent events for different types.

```javascript
const body = {
    groupID: 'g1234',
    type: 'joinmember' // 'leavegroup'
};

fetch('/grouptriggersseupdate', {
    method: 'POST',
    body,
});
```

## inviteLink

### /invitelink

Handles the counting of the generated and used invite links for users and groups.

```javascript
const body = {
    sentInviteLink: true, // could also be usedInviteLink: true
    type: 'join' // group
};

fetch('/invitelink', {
    method: 'POST',
    body
});
```

## keys

Handling of the public keys.

### /setkey

Sets the frontend generated public key for the acc of the actual session.

```javascript
const body = {
    publicKey: {
        crv: 'P-384',
        ext: 'true',
        key_ops: [],
        kty: 'EC',
        x: 'some part of key',
        y: 'other part of key'
    }
};

fetch('/setkey', {
    method: 'POST',
    body
});
```

### /getkey

Returns the public key for a given acc.

```javascript
const body = {
    accID: '10281'
};

fetch('/getkey', {
    method: 'POST',
    body
});
```

### /getkeys

Returns the public keys for several given accs.

```javascript
const body = {
    accIDs: ['10281', '10326']
};

fetch('/getkeys', {
    method: 'POST',
    body
});
```

## media

### /imageupload

Writes the encrypted base64 file to a .bin file on the server storage. The name of the file is a mix of sender nickname and contentID.

```javascript
const body = {
    content: 'some encrypted base64 string',
    contentID: 'random String',
    contentType: 'image',
    nickname: 'name of the sender',
    receiver: '10326',
    sender: '10281',
    threadID: '10281:10326',
    type: 'imageMessage'
};

fetch('/imageupload', {
    method: 'POST',
    body
});
```

### /imageget

Returns the encrypted file with sender contentID and type of the content.

```javascript
const body = {
    sender: '10281',
    contentID: 'generated id at upload'
};

fetch('/imageget', {
    method: 'POST',
    body
});
```

## utilities

### /insights

Returns some stats of the messenger.

```javascript
fetch('/insights', {
    method: 'GET'
});
```

Returns an array with numbers. Handled in frontend.

```javascript
[
    '10327', // accs generated. Starts at 10000
    '10023', // groups generated. Starts at 10000
    '352', // threads
    '4010', // messages
    '160', // generated invite links
    '53', // joined invite links
    '38', // generated group invite links
    '83', // used group invite links
]
```

### /subscribe

Adds the device keys for pushnotifications to the db.

```javascript
const body = {
    // the device keys
};

fetch('/subscribe', {
    method: 'POST',
    body
});
```
