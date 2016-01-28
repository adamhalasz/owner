
![owner.js icon](http://i.imgur.com/WJEYaXz.png)

# **Owner**
An Access Control List module for node.js. Good for protecting user *resources* and *operations*.

```js
owner('johnDoe')
    .in('posts')
    .select('XXX-YYY-ZZZ')
    .can('edit')
    .success(function(){
        // ... handle success
    })
    .deny(function(reason){
        // ... handle permission denied
    })
    .error(function(error){
        // ... handle error
    })
```

## **Install**
```
npm install owner
```

## **Features**
- Easy to use API
- Perfect for middleware
- Grant, Revoke, and Check Permissions
- Query Owner Resources, Resource Methods, Models
- Supports file system storage by default
- Support for custom storage mechanisms (mongodb/mysql/rethinkdb etc.)
- Owner/Model/Resource/Method Identifiers are simple Strings


## **Intro**
You won't really encounter with these definitions until you fiddle around with Events and Custom Storage, but it's good to know anyway:

- `Resource`:  A Protected Resource Identifier (ex: a specific Post in a blog)
- `Model`: An identifier for a Model of Resources (ex: Posts in a blog)
- `Owner`: The Resource Owner (ex: The Logged-In User)
- `Method`: A Resource's Method Identifier (ex: `comment`, `edit`, `delete`)

All of them can be virtually **anything**. They are plain old Strings. What makes them special is the relationship with your protected data.

![enter image description here](http://i.imgur.com/fcnmE3B.png)


### 

## **Usage**
```js
var Owner = require('owner');
var owner = new Owner();
owner.storage('file', '/path/to/file.json')
```

### **Grant Permission**

#### On All Resource Methods for Anyone (public)
Give access to `all` methods for `*` (anyone) on the requested `post` resource:

```js
// Grant Controller
function grant($){
    owner('*')
    .in('posts')
    .select($.params.id)
    .grant('*')
    .success($.return())
    .error(function(error){
        throw error;
    })
}

// Route
app.post('/posts/:postId/public', posts.public, grant)
```


#### On All Resource Methods for a single Owner
Give access to `all` methods for the `session user` on the requested `post` resource:

```js
// Grant Controller
function grant($){
    owner($.user.id)
    .in('posts')
    .select($.params.id)
    .grant('*')
    .success($.return())
    .error(function(error){
        throw error;
    })
}

// Route
app.post('/posts/:postId/create', grant, posts.comment)
```

#### On Selected Methods for a single Owner
Give access to `comment` and `edit` methods for the `session user` on the requested `post` resource:

```js
// Grant Controller
function grant($){
    owner($.user.id)
    .in('posts')
    .select($.params.id)
    .grant('comment', 'edit') // or ['comment', 'edit']
    .success($.return())
    .error(function(error){
        throw error;
    })
}

// Route
app.post('/posts/:postId/create', grant, posts.create)
```

### **Revoke Permission for a Method on a Resource**
Revoke grant to `comment` method from the `session user` on the requested `post` resource.

```js
// Revoke Controller
function revoke($){
    owner($.user.id)
    .in('posts')
    .select($.params.id)
    .revoke('comment')
    .success($.return())
    .error(function(error){
        throw error;
    })
}

// Route
app.post('/posts/:postId/remove', revoke, posts.remove)
```

### **Revoke All Permission to Resource**
Revoke grant completely from the `session user` to the requested `post` resource:

```js
// Revoke Controller
function revoke($){
    owner($.user.id)
    .in('posts')
    .select($.params.id)
    .revoke('*')
    .success($.return())
    .error(function(error){
        throw error;
    })
}

// Route
app.post('/posts/:postId/remove', revoke, posts.remove)
```


### **Check Resource Permission**
Check if the `session user` has access to the requested `post` resource:

```js
// Check Controller
function check($){
    owner($.user.id)
    .in('posts')
    .select($.params.postId)
    .can('*')
    .success($.return)
    .error(function(error, reason){
	    if(error) throw error;
	    if(reason) $.end('Cannot post: ' + reason);
    })
}

// Route
app.post('/posts/:postId', check, posts.view)
```


### **Check Method Permission on a Resource**
Check if the session user can comment on the requested post:
```js
// Check Controller
function check(){
    owner($.user.id)
    .in('posts')
    .select($.params.postId)
    .can('comment')
    .success($.return)
    .error(function(error, reason){
        $.notFound()
    })
}

// Route
app.post('/posts/:postId/comment', check, posts.comment)
```

### **List Resource Methods**
check if the session user can comment on the requested post
```js
// Method Controller
function methods($){
    owner($.user.id)
    .in('posts')
    .select($.params.postId)
    .list('methods')
    .success($.return)
    .error(function(error, reason){
        $.notFound()
    })
}

// Route
app.post('/posts/:postId', methods, posts.view)
```

### **List Owner Resources in a Model**
List all post `resources` owned by the `session user`:
```js
// Resource Controller
function resources($){
    owner($.userId)
    .in('posts')
    .list('resources')
    .success(function(data){
	    $.data.resources = data.resources;
		$.return()
	})
    .error(function(error, reason){
        $.notFound()
    })
}

// Route
app.post('/user/:userId', resources, posts.view)
```

### **List Owner Models**
List all post `resources` owned by the `session user`:
```js
// Model Controller
function models($){
    owner($.userId)
    .list('models')
    .success(function(data){
	    $.data.resources = data.models;
		$.return()
	})
    .error(function(error, reason){
        $.notFound()
    })
}

// Route
app.post('/user/:userId', models, posts.view)
```

## **API**

### **owner(** string ***`ownerId`*)**
Select an Owner with the specified ownerId (*string*)

### **.in(** string ***`modelId`*)**
Filter Resources within a Model.

### **.select(** string ***`resourceId`*)**
Select a Resource with the specified resourceId.
   
### **.has(** string ***`resourceId`*)**
Check if a Resource with the specified resourceId belongs to the specified User
   
### **.can(** string(s) ***`methodId`*...)**
Check if an Owner has permission to a Method with the specified `methodId` for the previously selected resource.

### **.grant(** string(s)***`methodId`*...)**
Give an Owner permission to a Method with the specified `methodId` for the previously selected resource.

### **.revoke(** string(s)***`methodId`*...)**
Give an Owner permission to a Method with the specified `methodId` for the previously selected resource.

### **.list(** string ***`type`*)**
Get a list of `models`, `resources`,  and `methods` or `all` them.

### **.success(** function ***`callback(data)`*)**
Function to run when the operation was successful. The **data** attribute in callback is only available when the `.list()` method is used.

### **.error(** function ***`callback(error, reason)`*)**
Function to run when the operation has failed.

### **Method Arguments**
**Examples**:

```js
owner.someMethod([a,b,c]) // multiple in array
owner.someMethod(a,b,c)   // multiple
owner.someMethod(a)       // single
owner.someMethod('*')     // all
```

## **Default Storage**
The default storage stores permissions in a file and caches it into memory.

## **Storage API**
To have custom storage you will have to handle the  `grant`, `revoke` and `request` events.   


### Event: **grant**

```js
owner.on('grant', function(event){
    // ... save to mongodb ...
    successCallback()
})

```

### Event: **revoke**

```js
owner.on('revoke', function(event){
	// ... remove permission from mongodb
	succesCallback()
})
```

### Event: **request**

```js
owner.on('request', function(event){
	// ... check permissions in mongodb
	successCallback()
})
```

Event Object
owner
- model
- resource
- method
- success
- deny
- error

