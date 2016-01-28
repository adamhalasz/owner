var fs = require('fs')
var util = require('util')

// File Driver
module.exports = function FileDriver(owner, options){
    
    source = options.source;
    console.log('owner: event -> init', options)
    
    fs.exists(source, function(exists){
        if(!exists){
            fs.writeFile(source, '{}', 'utf8', function(error){
                if(error) throw error;
                console.log('writeFile')
                if(options.ready) options.ready()
            })
        } else {
            if(options.ready) options.ready();
        }
    });
    
    owner.on('grant', function(event, success, deny, error){
        console.log('owner -> grant', event)
        
        fs.readFile(source, 'utf8', function(err, dataString){
            if(err) {
                console.trace(err)
                if(error) error(err); 
                return false;
            }
            
            var data = JSON.parse(dataString);
            
            console.log('owner -> grant -> data', event)
            
            initiate(data, event.group, event.owner, event.model, event.resource, event.attributes, event.methods)
            
            if(event.owner){
                var selector = data[event.group][event.owner];
            } else {
                var selector = data[event.group];
            }
            
            console.log('owner -> grant -> data', JSON.stringify(data, 0, 4))
            
            event.attributes.forEach(function(attribute){
                event.methods.forEach(function(method){
                    console.log(event.group, event.owner, event.model, event.resource, attribute, method)
                    selector[event.model][event.resource][attribute][method] = true;
                })
            })
            
            fs.writeFile(source, JSON.stringify(data, 0, 4), function(err){
                if(err) {
                    console.trace(err)
                    if(error) error(err); 
                    return false;
                }
                if(success) success()
            })
            
            console.log('owner -> grant -> data', data)
        })
    })
    
    owner.on('revoke', function(event, success, deny, error){
        console.log('owner -> revoke', arguments)
        
        fs.readFile(source, 'utf8', function(err, dataString){
            if(err) {
                console.trace(err)
                if(error) error(err); 
                return false;
            }
            
            var data = JSON.parse(dataString);
            
            console.log('owner -> revoke -> data', data)
            
            initiate(data, event.group, event.owner, event.model, event.resource, event.attributes, event.methods)
            
            event.methods.forEach(function(method){
                event.attributes.forEach(function(attribute){
                    data[event.group][event.owner][event.model][event.resource][attribute][method] = false;
                })
            })
            
            fs.writeFile(source, JSON.stringify(data, 0, 4), function(err){
                if(err) {
                    console.trace(err)
                    if(error) error(err); 
                    return false;
                }
                if(success) success()
            })
            
            console.log('owner -> revoke -> data', data)
        })
    })
    
    owner.on('can', function(event, success, deny, error){
        console.log('owner -> can', arguments)
        
        fs.readFile(source, 'utf8', function(err, dataString){
            if(err) {
                console.trace(err)
                if(error) error(err); 
                return false;
            }
            
            var data = JSON.parse(dataString);
            
            console.log('owner -> can -> data', data)
            
            initiate(data, event.group, event.owner, event.model, event.resource, event.attributes, event.methods)

            var reason;
            
            event.methods.forEach(function(method){
                event.attributes.some(function(attribute){
                    var permitted = data[event.group][event.owner][event.model][event.resource][attribute][method];
                    var allPermitted = data[event.group][event.owner][event.model][event.resource]['all'][method];
                    
                    if(!allPermitted && !permitted){
                        reason = 'Permission Denied\n'
                            + '    to Method("' + method + '") \n'
                            + '    on Attribute("' + attribute + '") \n'
                            + '    on Resource("' + event.resource + '")\n'
                            + '    on Model("' + event.model + '")\n'
                            + '    for Owner("' + event.owner + '") \n'
                            + '    in Group("'+event.group+'")';
                            
                        return false;
                    }
                })
            })
            
            if(!reason){
                success(event)
                
            } else {
                deny(reason)
                
            }
            
            console.log('owner -> can -> data', data)
        })
    })
    
    owner.on('list', function(event, success, deny, error){
       // console.log('owner -> list', arguments)
        
        fs.readFile(source, 'utf8', function(err, dataString){
            if(err) {
                console.trace(err)
                if(error) error(err); 
                return false;
            }
            
            var data = JSON.parse(dataString);
            
            //console.log('owner -> list -> data', data)
            
            initiate(data, event.group, event.owner, event.model, event.resource, event.attributes, event.methods)
            
            console.log('event.resource', event.resource)
            var output = data[event.group][event.owner];
            if(event.model) output = output[event.model]
            if(event.resource && event.resource != 'all') {
                output = output[event.resource]
            }
            
            if(event.attributes && event.attributes != 'all') {
                attributes = {};
                event.attributes.forEach(function(attribute){
                    attributes[attribute] = output[attribute]
                })
                output = attributes;
            }
            //if(event.attributes) output = {}
            
            
            
            /*
            var reason;
            
            event.methods.forEach(function(method){
                event.attributes.some(function(attribute){
                    var permitted = data[event.group][event.owner][event.model][event.resource][attribute][method];
                    
                })
            })*/
            
           success(output)
            
            //console.log('owner -> can -> data', data)
        })
    })
    
    function initiate(data, group, owner, model, resource, attributes, methods){

        /*
        if(!group) group = '*';
        if(!resource) resource = '*'
        if(!model) model = '*'
        */
  
        if(!data[group]) data[group] = {};
        if(owner && !data[group][owner]) selector = data[group][owner] = {};
        
        if(owner){
            var selector = data[group][owner];
        } else {
            var selector = data[group];
        }
        
        if(!selector[model]) selector[model] = {};
        if(!selector[model][resource]) selector[model][resource] = {};
        if(!selector[model][resource]['all']) selector[model][resource]['all'] = {};
        
        if(attributes){
            attributes.forEach(function(attribute){
                //if(!data[owner][model][resource]['*']) data[owner][model][resource]['*'] = {};
                //console.log('selector', selector)
                
                //console.log('model', model)
                //console.log('resource', resource)
                //console.log('attribute', attribute)
                if(!selector[model][resource][attribute]) selector[model][resource][attribute] = {};
                if(methods){
                    methods.forEach(function(method){
                        if(!selector[model][resource][attribute][method]){
                            selector[model][resource][attribute][method] = false;
                            
                        }
                        
                        if(!selector[model][resource]['all'][method]){
                            selector[model][resource]['all'][method] = false;
                        }
                        //if(!data[group][owner][model][resource]['*'][method]) data[group][owner][model][resource]['*'][method] = false;
                    })
                }
            })
        }
        
    }
    
}
