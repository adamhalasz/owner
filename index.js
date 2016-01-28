// ======================================================
//  Dependencies
// ======================================================

    var async = require('async')
    var util = require('util')
    var EventEmitter2 = require('eventemitter2').EventEmitter2;

// ======================================================
//  Config: Owner Object
// ======================================================
    
    function OwnerConstructor(){
        return Owner;
    }
    
    function Owner(ownerId){
        this.event = {};
        this.event.owner = ownerId ? ownerId.toString().toLowerCase().trim() : null ;
        return this;
    }
    
    var emitter = new EventEmitter2();
        Owner.on = emitter.on;
        Owner.emit = emitter.emit; 
    
// ======================================================
//  Config: Selectors
// ======================================================
    
    Owner.prototype.group = function Group(group){
        this.event.group = group ? group.toString().toLowerCase().trim() : null ;
        return this;
    }
    
    Owner.prototype.in = function In(model){
        this.event.model = model ? model.toString().toLowerCase().trim() : null ;
        return this;
    }

    Owner.prototype.select = function Select(resource){
        this.event.resource = resource ? resource.toString().toLowerCase().trim() : null ;
        return this;
    } 
    
    Owner.prototype.attributes = function Attributes(){
        this.event.attributes = parseArguments(arguments);
        return this;
    }    
    

// ======================================================
//  Config: Public Operations
// ======================================================
    /*
    Owner.prototype.has = function Has(resourceId){
        this.methods = parseArguments(arguments)
        this.operation = 'has';
        return this;
    }*/
    
    Owner.prototype.list = function List(){
        this.event.list = parseArguments(arguments)
        this.operation = 'list';
        return this;
    }
    
    Owner.prototype.can = function Can(){
        this.event.methods = parseArguments(arguments)
        this.operation = 'can';
        return this;
    }
    
    Owner.prototype.grant = function Grant(){
        this.event.methods = parseArguments(arguments)
        this.operation = 'grant';
        return this;
    }
    
    Owner.prototype.revoke = function Revoke(){
        this.event.methods = parseArguments(arguments)
        this.operation = 'revoke';
        return this;
    }
    
    Owner.prototype.run = function Run(){
        if(!this.event.group) this.event.group = 'all';
        if(!this.event.model) this.event.model = 'all'
        if(!this.event.resource) this.event.resource = 'all'
        if(!this.event.attributes || !this.event.attributes.length) this.event.attributes = ['all'] ;
        console.log('this.event', this.event)
        Owner.emit(this.operation, this.event, this.success, this.deny, this.error)
        return this;
    }
 
 // ======================================================
 //  Config: Callbacks
 // ======================================================   
    Owner.prototype.success = function Success(callback){
        this.success = callback;
        return this;
    }
    
    Owner.prototype.deny = function Error(callback){
        this.deny = callback;
        return this;
    }

    Owner.prototype.error = function Error(callback){
        this.error = callback;
        return this.run()
    }

// ======================================================
//  Driver
// ======================================================
    var drivers = {}
    function Driver(name, callback){
        drivers[name] = callback;
    }

// ======================================================
//  Utilities
// ======================================================

    /*
        Supported argument syntaxes:
        - [a,b,c]
        - a,b,c
    */
    function parseArguments(Args){
        var args = [];
        for(var i = 0; i < Args.length; i++) {
            if(typeof Args[i] == 'string') {
                Args[i].split(',').forEach(function(arg){
                    args.push(arg.trim())
                });
            }
        }
        return args;
        /*
        if(args.length == 1){
            // string
            if(typeof args == 'object'){
                return args;
                
            // invalid type
            } else {
                throw new Error('invalid type')
            }
        } else {
            return args;
        }*/
    }


// ======================================================
//  Exports
// ======================================================
    
    module.exports = OwnerConstructor;
    module.exports.driver = Driver;
    