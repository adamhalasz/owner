// ======================================================
//  Dependencies
// ======================================================

    var asnyc = require('async')
    

// ======================================================
//  Owner Object
// ======================================================
    
    function Owner(owernId){
        this.ownerId = ownerId;
        return this;
    }
    

// ======================================================
//  Selectors
// ======================================================
    
    Owner.prototype.in = function(classId){
        var that = this;
        this.classId = classId;
        return this;
    }
    
    Owner.prototype.select = function(resourceId){
        var that = this;
        this.resourceId = resourceId;
        return this;
    }    
    

// ======================================================
//  Public Operations
// ======================================================
    
    Owner.prototype.has = function(resourceId){
        this.has = resourceId;
        return this;
    }
    
    Owner.prototype.can = function(){
        this.can = arguments;
        return this;
    }
    
    Owner.prototype.grant = function(){
        this.grant = arguments;
        return this;
    }
    
    Owner.prototype.revoke = function(){
        this.revoke = arguments;
        return this;
    }
    
    Owner.prototype.run = function(){
        if(this.has) this.operations.has()
        if(this.can) this.operations.can()
        if(this.grant) this.operations.grant()
        if(this.revoke) this.operations.revoke()
    }
 
 // ======================================================
 //  Callbacks
 // ======================================================   
    Owner.prototype.success = function(callback){
        this.success = callback;
        return this;
    }
    
    Owner.prototype.error = function(callback){
        this.error = callback;
        this.run()
        return this;
    }

// ======================================================
//  Private Operations
// ======================================================
    Owner.prototype.operations = {};
    Owner.prototype.operations.has = function(){
        var that = this;
        var options = getOptions(arguments)
        var methods = options.methods;
        var callback = options.callback;
        var passed = true;
        var reasons = [];
        
        async.each(methods, function(method, next){
            
            // all
            if(method == '*'){
                that.hasAllMethods(method, handler)
            
            // specific
            } else {
                that.hasSpecificMethod(method, handler)
            }
            
            function handler(error, failed, reason){
                if(error) {
                    throw error;
                } else {
                    if(failed){
                        reasons.push(reason)
                        passed = false;
                    }
                    next()
                }
            }
            
        }, finish)
        
        function finish(){
            if(passed){
                that.success()
            } else {
                that.error()
            }
        }
    }
    
    Owner.prototype.hasAllMethods = function(){
        
    }
    
    Owner.prototype.hasSpecificMethod = function(method, callback){
        var that = this;
        that.storage.request({
            owner: that.ownerId,
            class: that.classId,
            resource: that.resourceId
        }, function(error, document){
            if(error) callback(error)
            
            if(document){
                callback(null, false, null)
            
            } else if (!document.methods.has(method)) {
                callback(null, true, null)
                
            } else {
                
            }
             
        })
    }

// ======================================================
//  Storage
// ======================================================
    
    Owner.prototype.storage = function(name, callback){
        
    }

// ======================================================
//  Utilities
// ======================================================

    /*
        Supported argument syntaxes:
        - [a,b,c]
        - a,b,c
    */
    function getOptions(args){
        if(args.length == 1){
            // string
            if(typeof args == 'string'){
                
                return [args[0]]
                
            // array
            } else if (typeof args == 'object') {
            
                return args;
                
            // invalid type
            } else {
                throw new Error('invalid type')
            }
        } else {
            return args;
        }
    }


// ======================================================
//  Exports
// ======================================================

    module.exports = Owner;
    
