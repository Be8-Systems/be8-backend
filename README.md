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
    password: 'randomly generated'
}

fetch('/newacc', {
    method: 'POST',
    body
});
```

### /me
Returns the acc (without password) of the actual session.

```javascript
fetch('/me', {
    method: 'GET'
});
```

### /changenickname
User can change his nick every time and as often as he wants to.

```javascript
const body = {
    newNickname: 'picked new name',
    oldNickname: 'former name'
};

fetch('/changeNickname', {
    method: 'POST',
    body
});
```

### /destroyacc
Deletes the acc of the actual session and all conversations of the acc. If acc is a group admin, the group will be deleted too.

```javascript
fetch('/destroyacc', {
    method: 'GET'
});
```