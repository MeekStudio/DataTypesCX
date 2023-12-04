const crypto = require("node:crypto");

class DataType {
    constructor(){}

    static #allowBasicHTML = false;
    static #removeAllHTMLTags = /(<[^>]+>)/g;
    static #keepBasicHTMLTags = /(<[^>]+>)/g;

    static stripHTML(value, {allowBasicHTML = DataType.#allowBasicHTML} = {}){
        const regExp = (allowBasicHTML) ? DataType.#keepBasicHTMLTags : DataType.#removeAllHTMLTags;

        const stripped = value.replace(regExp, "");

        return stripped
    }

    
}

class Identifier extends DataType {
    constructor(){}

    static #minLength = 5;
    static #maxLength = 100;
    static #reservedWords = ["matter", "edition", "slot", "model", "editor", "user", "cx"];
    static #syntax = /^([a-z][a-z0-9_]+[a-z])$/g;

    static test(value){
        const errors = [];

        if(typeof value === "number"){
            value = value.toString();
        }

        if(typeof value === "string"){
            value = this.stripHTML(value);

        } else {
            errors.push("TYPE_MISMATCH")
        
        }
        
        if(value.length < this.#minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > this.#maxLength){
            errors.push("TOO_LONG")
        }

        if(!this.#syntax.test(value)){
            errors.push("SYNTAX_ERROR")
        }

        if(this.#reservedWords.indexOf(value).length > -1){
            errors.push("RESERVED_WORD");
        }
       
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
}

class ShortText extends DataType {
    constructor(){}

    static #minLength = 0;
    static #maxLength = 255;
    static #allowBasicHTML = false;
    
    static test(value, {
        minLength = this.#minLength,
        maxLength = this.#maxLength
    } = {}){
        
        const errors = [];

        if(typeof value === "number"){
            value = value.toString();
        }

        if(typeof value === "string"){
            value = this.stripHTML(value);

        } else {
            errors.push("TYPE_MISMATCH")
        
        }
        
        if(value.length < minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > maxLength){
            errors.push("TOO_LONG")
        }
       
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
    
}

class LongText extends DataType {
    constructor(){}
    
    static #minLength = 0;
    static #maxLength = 50000;
    
    static test(value, {
        minLength = this.#minLength,
        maxLength = this.#maxLength
    } = {}){
        const errors = [];
        value = this.stripHTML(value);
        
        if(value.length < minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > maxLength){
            errors.push("TOO_LONG")
        }
       
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
    
}



class Email extends DataType{
    constructor(){}
    
    static #minLength = 5;
    static #maxLength = 255;
    static #syntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    static test(value, {
        syntax = this.#syntax,
        minLength = this.#minLength,
        maxLength = this.#maxLength
    } = {}){
        const errors = [];
        value = this.stripHTML(value);
        
        if(value.length < minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > maxLength){
            errors.push("TOO_LONG")
        }
        
        if(!syntax.test(value)){
            errors.push("SYNTAX_ERROR")
        }
        
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
    
}




class Url extends DataType {
    constructor(){}
    
    static #minLength = 5;
    static #maxLength = 255;
    static #httpsOnly = true;
    static #syntax = /^http(s)?:\/\/[a-zA-Z0-9.-@]+.[a-zA-Z]{2}$/;
       
    static test(value, {
        syntax = this.#syntax,
        httpsOnly = this.#httpsOnly,
        minLength = this.#minLength,
        maxLength = this.#maxLength
    } = {}){
        const errors = [];
        value = this.stripHTML(value);
        
        if(value.length < minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > maxLength){
            errors.push("TOO_LONG")
        }

        if(httpsOnly && value.substring(0, 8) !== "https://"){
            errors.push("MUST_USE_HTTPS")
        }
        
        if(!syntax.test(value)){
            errors.push("SYNTAX_ERROR")
        }
        
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
    
}

class Password extends DataType {
    constructor(){}
    
    static #minLength = 8;
    static #maxLength = 255;
    
    static #syntax = [
        {
            type: "lowercase",
            regexp: /[a-z]/g,
            min: 2
        },{
            type: "uppercase",
            regexp: /[A-Z]/g,
            min: 2
        },{
            type: "numbers",
            regexp: /[0-9]/g,
            min: 2
        },{
            type: "special",
            regexp: /[@!\-_#.,$()]/g,
            min: 2
        }
    ]
    
    static test(value, {
            syntax = this.#syntax,
            minLength = this.#minLength,
            maxLength = this.#maxLength
        } = {}){
        
        const errors = [];
        value = this.stripHTML(value);
        
        if(value.length < minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > maxLength){
            errors.push("TOO_LONG")
        }
        
        syntax.forEach((rule) => {
            const occurances = value.match(rule.regexp) || [];
            
            if(occurances.length < rule.min){
                errors.push(`REQUIRES_MIN_${rule.min}_${rule.type.toUpperCase()}`)
            }
            
        })
        
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
    
}



class Stamp extends DataType {
    #created;
    static name = "Stamp";
    static #syntax = /^(\d)+$/;

    constructor(){
        super();
        this.#created = Stamp.now();
    }

    get created(){
        return this.#created
    }

    get age(){
        const startTimestamp = this.created;
        
        return Stamp.now() - startTimestamp;
    }

    static age(timestamp){
        const {valid, errors, sanitised} = this.test(timestamp);

        if(!valid){
            return new Error(errors)
        }

        return this.now() - sanitised

    }

    static now(){
        return Date.now()
    }

    static test(value, {
        syntax = this.#syntax
    } = {}){
        
        const errors = [];
        
        if(!syntax.test(value)){
            errors.push("SYNTAX_ERROR")
        }
       
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
}

class EventLogger {
    events = []

    constructor(){
    }

    new(label){
        const {valid, errors, sanitised} = ShortText.test(label);

        if(!valid){
            return new Error(errors)
        }

        this.events.push({
            label: sanitised,
            timestamp: Stamp.now()
        })
    }

    find(label){
        const events = this.events.filter(log => log.label === label);
        const timestamps = events.map(log => log.timestamp);

        return timestamps;
    }

    age(label){
        const events = this.events.filter(log => log.label === label);
        const timestamps = events.map(log => {
            return Stamp.age(log.timestamp)
        });

        return timestamps;
    }
}


class Squid {
    static name = "Squid";
    static #syntax = /^([0-9a-fA-F]{32})$/;
    
    constructor(){}

    static test(value, {
        syntax = this.#syntax
    } = {}){

        const errors = [];
        
        if(!syntax.test(value)){
            errors.push("SYNTAX_ERROR")
        }
       
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }

    static generate(){
       return crypto.randomUUID().replace(/-/g, "");
    }

}




class NameSpace {
    static name = "NameSpace";
    
    constructor(){

    }
}

class PhoneNumber extends DataType {
    static name = "PhoneNumber";
    constructor(){}

    static #minLength = 0;
    static #maxLength = 255;
    static #allowBasicHTML = false;
    
    static test(value, {
        minLength = this.#minLength,
        maxLength = this.#maxLength
    } = {}){
        
        const errors = [];
        value = this.stripHTML(value);
        
        if(value.length < minLength){
            errors.push("TOO_SHORT")
        }
        
        if(value.length > maxLength){
            errors.push("TOO_LONG")
        }
       
        const valid = (errors.length === 0);
        const sanitised = (valid) ? value : null;
        
        return {
            valid,
            errors,
            sanitised
        };
    }
    
}

const DataTypes = {
    Stamp,
    Squid,
    ShortText,
    LongText,
    Email,
    Url,
    Password,
    NameSpace,
    PhoneNumber,
    EventLogger,
    Identifier
}

module.exports = {
    ...DataTypes,
    DataTypes
}