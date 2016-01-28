
// todos
- groups
- revoke
- easier driver loading
- mongo driver
- redis driver
- rethinkdb driver


// ============================================================
//   Owner Setup
// ============================================================
var Owner = require('../');

// ============================================================
//   Owner Instance
// ============================================================
var owner = new Owner()
require('../drivers/file')(owner, { source: __dirname + '/owner.json', ready: ready })

// ============================================================
//  Data Sample
// ============================================================
    
    var db = {};
    db.teams = {};
    db.posts = {};
    db.posts[1] = {
        id: 1,
        title: 'Hello World',
        user: 100
    }
    db.posts[2] = {
        id: 2,
        title: 'Spring is almost here',
        description: 'after winter has ended',
        user: 100
    }

// Setup Group Permissions
var async = require('async')

function ready(){
    async.series([
        function(done){
            // grant `read` access for `id` `name` `title` attributes to anyone on every model
            new owner().group('all').in('all').grant('read').attributes('id', 'name', 'title').success(done).run()
        },
        function(done){
            new owner().group('admin').in('teams').grant('all').attributes('all').success(done).run()
        },
        function(done){
            new owner().group('moderator').in('teams').grant('create', 'read', 'update').attributes('all').success(done).run()
        },
        function(done){
            new owner().group('member').in('teams').grant('read').attributes('id', 'name', 'members').success(done).run()
        },
        function(done){
            new owner().group('member').in('teams').grant('invite').attributes('id', 'name', 'members').success(done).run()
        },
        function(done){
            new owner().group('guest').in('teams').grant('read').attributes('id', 'name', 'members').success(done).run()
        },
    ], function(){
        console.log('finished');
    })
}

/*
new owner($.user.id)
    .in('teams')
    .can('update')
    .attributes('title')
    .success(function(){
    
    }).deny(function(){
        
    })
*/

// ============================================================
//  Routes
// ============================================================
var app = require('diet')()
app.listen(8000)

// GRANT PERMISSION
app.get('/posts/grant/:post/:user', function($){
    console.log('posts/grant', $.params)
    
    new owner($.params.user)
        .in('posts')
        .select($.params.post)
        .attributes('all')
        .grant('read')
        .success(function(){
            $.end('permission granted')
        }).error(function(error){
            console.trace(error)
            throw error;
        })
        
})

app.get('/add/:user/:group/:model', function(){
    // Add :user to :group in :model
    new owner($.params.user).is($.params.group).of($.params.model).run()
    $.end('success')
})

// GRANT PERMISSION to GROUP 'admin'
app.get('/posts/grantGroup/:post/:group', function($){
    console.log('posts/grantGroup', $.params)
    
    new owner()
        .group('admin')
        .in('posts')
        .grant('all')
        .success(function(){
            $.end('permission granted')
        }).error(function(error){
            console.trace(error)
            throw error;
        })
        
})

// REVOKE PERMISSION
app.get('/revoke/:method/:model/:resource?/:attributes?', function($){
    console.log('posts/revoke', owner)

    new owner(100)
        .in($.params.model)
        .select($.params.resource)
        .attributes($.params.attributes)
        .revoke('read')
        .success(function(){
            $.end('permission revoked')
        }).error(function(error){
            console.trace(error)
            throw error;
        })
        
})

// CHECK PERMISSION
app.get('/check/:method/:model/:resource?/:attributes?', function($){
    new owner(100)
        .in($.params.model)
        .select($.params.resource)
        .attributes($.params.attributes)
        .can($.params.method)
        .success(function(event){
            
            // get db entry
            var model = db[$.params.model];
            var output = model && model[$.params.resource] 
                ? db[$.params.model][$.params.resource] 
                : ['No Records Found'] ;
                
            if(event.attributes.length){
                output = {};
                event.attributes.forEach(function(attribute){
                    output[attribute] = db[$.params.model][$.params.resource][attribute]
                })
                
            }
            
            $.end('Permission Granted:\n\n'+$.params.model+'\n' + JSON.stringify(output,0,4));
        }).deny(function(reason){
            //$.header('content-type', 'text/html')
            $.end(reason)
        }).error(function(error){
            throw error;
        })
})

// LIST OWNER PERMISSION
app.get('/list/:method?/:model?/:resource?/:attributes?', function($){
    new owner(100)
        .in($.params.model)
        .select($.params.resource)
        .attributes($.params.attributes)
        .can($.params.method)
        .list()
        .success(function(list){
            $.end('Permission Granted\n\n' + JSON.stringify(list, 0, 4));
            
        }).error(function(error){
            throw error;
        })
        
        
            //.in($.params.model)
            //.select($.params.resource)
            //.can($.params.method)
})