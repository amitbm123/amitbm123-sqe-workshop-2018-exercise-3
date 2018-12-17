
import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, { loc:true, range:true});
};

export {parseCode};

//var safeEval = require('safe-eval');

let globals=[];
let vars=[];
let argument=[];
let stringCode='';
let subString='';
let params=[];

let flag = false;
export {stringCode};



function setArgs(args){
    argument = args.split(' ');
}

function setParams(json){
    for(let i=0;i<json.length;i++){
        params.push(json[i].name);
    }
}

function globalIsParam(i){
    for (let j = 0; j < globals.length; j++) {
        if (params[i] === globals[j].name) {
            globals[j].val = argument[i];
            flag = false;
        }
    }
}
function boundParams(){
    let flag=true;
    for(let i=0;i<params.length;i++) {
        if (argument[i].charAt(0) === '[' && argument[i].charAt((argument[i].length - 1)) === ']') {
            arrayRec(argument[i], params[i]);
        }
        globalIsParam(i);
        if (flag === true) {
            globals.push({name: params[i], val: argument[i]});
        }
        else flag = true;

    }
}

function arrayRec(arg, parm){
    let arr = (arg.substring(1, arg.length - 1)).split(',');
    for (let j = 0; j < arr.length; j++) {
        globals.push({name: parm.concat('[').concat(j.toString()).concat(']'), val: arr[j]});
        if (arr[j].charAt(0) === '[' && arr[j].charAt((arr[j].length - 1)) === ']'){
            arrayRec(arr[j],parm.concat('[').concat(j.toString()).concat(']'));
        }
    }
}


function updateGlobals(str){
    let arr = str.split(' ');
    for(let i=0;i<arr.length;i++){
        for(let j=0;j<globals.length;j++){
            if (globals[j].name === arr[i])
                arr[i] = globals[j].val;
        }
    }
    return arr.join(' ');
}

function parseWhileStatementNext(json){
    let gibui = copyVars(globals);
    subString=subString.concat('while(').concat(getGlobalVal(json.test)).concat(')');
    if(json.body.type==='BlockStatement') {
        subString = subString.concat('{\n');
        parseb(json.body.body);
        subString = subString.concat('}\n');
    }
    else {
        subString = subString.concat('\n');
        parseb([json.body]);
    }
    globals=copyVars(gibui);
}

function parseIfStatementNext(json){
    let gibui = copyVars(globals);
    subString = subString.concat('if(').concat(getGlobalVal(json.test)).concat(')');
    if(json.consequent.type==='BlockStatement') {
        subString = subString.concat('{\n');
        parseb(json.consequent.body);
        subString = subString.concat('}\n');
    } else{
        subString = subString.concat('\n');
        parseb([json.consequent]);}
    globals = copyVars(gibui);
    if (json.alternate!=null && json.alternate.type==='BlockStatement') {
        subString = subString.concat('else{\n');
        parseb(json.alternate.body);
        subString = subString.concat('}\n');
    } else if(json.alternate != null){
        subString = subString.concat('else\n');
        parseb([json.alternate]);
    } globals = copyVars(gibui);
}


function parsefunctionDeclaration(json) {
    subString = subString.concat(stringCode.substring(json.range[0], json.body.range[0]+1)).concat('\n');
    setParams(json.params);
    boundParams();
    parseb2(json.body.body);
    subString = subString.concat('}\n');
}

function parseVariableDeclarationNext(json){
    if(json.init == null){
        let map = {name: json.id.name,val: ''};
        globals.push(map);
        subString = subString.concat('let ').concat(json.id.name).concat(';\n');
    } else {
        if (json.init.type === 'ArrayExpression') {
            let arr = '[';
            for (let i = 0; i < json.init.elements.length; i++) {
                globals.push({name: json.id.name.concat('[').concat(i.toString()).concat(']'), val: json.init.elements[i].raw});
                arr = arr.concat(json.init.elements[i].raw).concat(',');
            }
            arr = (arr.substring(0, arr.length - 1)).concat(']');
            globals.push({name: json.id.name, val: arr});
            subString = subString.concat('let ').concat(json.id.name).concat('=').concat(arr).concat(';\n');
        } else {
            let map = {name: json.id.name, val: getGlobalVal(json.init)};
            globals.push(map);
            subString = subString.concat('let ').concat(json.id.name).concat('=').concat(getGlobalVal(json.init)).concat(';\n');
        }}}

function parseAssignmentExpressionNext(json) {
    let name=  stringCode.substring(json.expression.left.range[0], json.expression.left.range[1]);
    for(let i=0;i<globals.length;i++) {
        if(globals[i].name===name) {
            globals[i].val = getGlobalVal(json.expression.right);
        }
    }
    let rig = stringCode.substring(json.expression.right.range[0],json.expression.right.range[1]);
    subString=subString.concat(name).concat(' = ').concat(rig).concat(';\n');
}

const  parseb =(body) =>{
    for(let i=0;i<body.length;i++){
        switch (body[i].type){
        case 'FunctionDeclaration': parsefunctionDeclaration(body[i]); break;
        case 'WhileStatement': parseWhileStatementNext(body[i]); break;
        case 'IfStatement': parseIfStatementNext(body[i]); break;
        default: parsebNext(body[i]);
        }
    }
};

const parsebNext = (body)=>{
    switch (body.type) {
    case 'VariableDeclaration': parseb(body.declarations);break;
    case  'VariableDeclarator': parseVariableDeclarationNext(body); break;
    case 'ExpressionStatement': parseAssignmentExpressionNext(body); break;
    }
};

function globalValMember(json){
    let inside = getGlobalVal(json.property);
    let inside2 = stringCode.substring(json.property.range[0],json.property.range[1]);
    let val2 = eval(inside);
    let nameToCheck = json.object.name.concat('[').concat(val2).concat(']');
    let valToTable = '';
    for(let i=0; i<globals.length; i++)
        if(globals[i].name === nameToCheck)
            valToTable = globals[i].val;

    globals.push({name: inside2,val: valToTable});
    return inside2;
}

function globalValIdentifier(json){
    for(let i=0;i<globals.length;i++){
        if(globals[i].name===json.name)
            return globals[i].val;
    }
}
function getGlobalVal(json){
    if(json.type==='MemberExpression'){
        return globalValMember(json);
    }
    if(json.type==='Identifier'){
        return globalValIdentifier(json);
    }
    else if(json.type==='Literal')
        return json.raw;
    else
        return '( '.concat(getGlobalVal(json.left)).concat(' ').concat(json.operator.concat(' ').concat(getGlobalVal(json.right))).concat(' )');

}














/*function parseVariableDeclarationIdentifier(json){
    let map = {line: json.loc.start.line, type: 'VariableDeclaration', name: json.name, condition: '', value: ''};
    arrayTable.push(map);
}*/
function parseVariableDeclaration(json){
    if(json.init == null){
        let map = {name: json.id.name,val: ''};
        vars.push(map);
    }
    else{
        if(json.init.type==='ArrayExpression'){
            let arr='[';
            for(let i=0;i<json.init.elements.length;i++){
                vars.push({name:json.id.name.concat('[').concat(i.toString()).concat(']') , val: json.init.elements[i].raw});
                arr = arr.concat(json.init.elements[i].raw).concat(',');
            }
            arr=(arr.substring(0,arr.length-1)).concat(']');
            vars.push({name: json.id.name, val: arr});
        } else {
            let map = {name: json.id.name, val: (getVal(json.init))};
            vars.push(map);
        }
    }
}
function findVal(json,name2,nameToCheck){
    let valToTable = '';
    for(let i=0; i<globals.length; i++)
        if(globals[i].name === nameToCheck)
            valToTable = globals[i].val;
    for(let i=0; i<vars.length; i++){ //if locals is a[0]
        if(vars[i].name === nameToCheck)
            valToTable =  vars[i].val;
    }
    globals.push({name: name2,val: valToTable});
}
function valMember(json){
    let inside = getVal(json.property);
    let arr = inside.split(' ');
    let insideJoin = arr.join('');
    if(inside === updateGlobals(inside)) {
        let val = eval(insideJoin);
        let name = json.object.name.concat('[').concat(val).concat(']');
        for (let i = 0; i < vars.length; i++) { //if locals is a[0]
            if (vars[i].name === name)
                return vars[i].val;
        }
    }
    let val2 = eval(updateGlobals(inside));
    let nameToCheck = json.object.name.concat('[').concat(val2).concat(']');
    let name2 = json.object.name.concat('[').concat(insideJoin).concat(']');
    findVal(json,name2,nameToCheck);
    return name2;
}

function valIdentifier(json){
    for(let i=0;i<vars.length;i++){
        if(vars[i].name===json.name)
            return vars[i].val;
    }
    return json.name;
}
function getVal(json){
    if(json.type==='MemberExpression'){
        return valMember(json);
    }
    if(json.type==='Identifier'){
        return valIdentifier(json);
    }
    else if(json.type==='Literal')
        return json.raw;
    else
        return '( '.concat(getVal(json.left)).concat(' ').concat(json.operator.concat(' ').concat(getVal(json.right))).concat(' )');

}

function copyVars(old){
    let gibui=[];
    for(let i=0;i<old.length;i++){
        gibui.push({name:old[i].name,val:old[i].val});
    }
    return gibui;
}

function colorGreen(json){
    if (flag) {
        subString = (subString.substring(0, subString.length - 5)).concat('<mark class="green" id="green"> ').concat(subString.substring(subString.length - 5, subString.length)).concat('if(').concat(getVal(json.test)).concat(')');
        flag = false;
    }
    else
        subString = subString.concat('<mark class="green" id="green"> ').concat('if(').concat(getVal(json.test)).concat(')');

}

function colorRed(json){
    if (flag) {
        subString = (subString.substring(0, subString.length - 5)).concat('<mark class="red" id="red"> ').concat(subString.substring(subString.length - 5, subString.length)).concat('if(').concat(getVal(json.test)).concat(')');
        flag = false;
    }
    else
        subString = subString.concat('<mark class="red" id="red"> ').concat('if(').concat(getVal(json.test)).concat(')');
}

function thenIf(json){
    if(json.consequent.type==='BlockStatement') {
        subString = subString.concat('{ </mark> \n');
        parseb2(json.consequent.body);
        subString = subString.concat('}\n');
    }
    else {
        subString = subString.concat('</mark> \n');
        parseb2([json.consequent]);
    }
}

function checkElseIf(json){
    if(json.alternate.type ==='IfStatement') {
        flag = true;
        subString = subString.concat('else ');
    }
    else {
        flag = false;
        subString = subString.concat('else\n');
    }
    parseb2([json.alternate]);
}
function parseIfStatement(json){
    let gibui = copyVars(vars);
    let gibui2 = copyVars(globals);
    if(eval(updateGlobals(getVal(json.test)))===true) {
        colorGreen(json);
    } else {
        colorRed(json);}
    thenIf(json);
    vars = copyVars(gibui);
    globals = copyVars(gibui2);
    if (json.alternate!=null && json.alternate.type==='BlockStatement') {
        subString = subString.concat('else{\n');
        parseb2(json.alternate.body);
        subString = subString.concat('}\n');
    } else if(json.alternate != null){
        checkElseIf(json);
    }
    vars = copyVars(gibui);
    globals = copyVars(gibui2);
}

/*function parseIfStatement(json){
    let gibui = copyVars(vars);
    let gibui2 = copyVars(globals);
    let enter = false;

    if(safeEval(updateGlobals(getVal(json.test)))==true) {
        subString = subString.concat('<mark class="green" id="green"> ').concat('if(').concat(getVal(json.test)).concat(')');
        enter = true;
    }
    else
        subString = subString.concat('<mark class="red" id="red"> ').concat('if(').concat(getVal(json.test)).concat(')');

    if(json.consequent.type=='BlockStatement') {
        subString = subString.concat('{ </mark> \n');
        parseb2(json.consequent.body);
        subString = subString.concat('}\n');
    }
    else {
        subString = subString.concat('</mark> \n');
        parseb2([json.consequent]);

    }
    if(enter == false) {
        vars = copyVars(gibui);
        globals = copyVars(gibui2);
    }
    else{
        gibui = copyVars(vars);
        gibui2 = copyVars(globals);
    }
    if (json.alternate!=null && json.alternate.type=='BlockStatement') {
        subString = subString.concat('else{\n');
        parseb2(json.alternate.body);
        subString = subString.concat('}\n');
    }
    else if(json.alternate != null){
        subString = subString.concat('else\n');
        parseb2([json.alternate]);
    }

    if(enter == true) {
        vars = copyVars(gibui);
        globals = copyVars(gibui2);
    }

}*/
function ifVar(json, name,  i){
    if(json.expression.right.type==='ArrayExpression'){
        let arr='[';
        for(let j=0;j<json.expression.right.elements.length;j++){
            vars.push({name:name.concat('[').concat(j.toString()).concat(']') , val: json.expression.right.elements[j].raw});
            arr = arr.concat(json.expression.right.elements[j].raw).concat(',');
        }
        arr=(arr.substring(0,arr.length-1)).concat(']');
        vars[i].val=arr;
    }
    else
        vars[i].val =(getVal(json.expression.right));
}

function ifGlobal(name, json){
    subString = subString.concat(name).concat(' = ').concat(stringCode.substring(json.expression.right.range[0],json.expression.right.range[1])).concat(';\n');
    for (let i = 0; i < globals.length; i++) {
        if (globals[i].name === name) {
            let arr='[';
            for(let i=0;i<json.expression.right.elements.length;i++){
                globals.push({name:name.concat('[').concat(i.toString()).concat(']') , val: json.expression.right.elements[i].raw});
                arr = arr.concat(json.expression.right.elements[i].raw).concat(',');
            }
            arr=(arr.substring(0,arr.length-1)).concat(']');
            globals[i].val=arr;
        }
    }
}

function elseIfglobal(json,name){
    subString = subString.concat(name).concat(' = ').concat(getVal(json.expression.right)).concat(';\n');
    for (let i = 0; i < globals.length; i++) {
        if (globals[i].name === name) {
            globals[i].val = updateGlobals(getVal(json.expression.right));
        }
    }
}
function parseAssignmentExpression(json) {
    let name=  stringCode.substring(json.expression.left.range[0], json.expression.left.range[1]);
    for(let i=0;i<vars.length;i++) {
        if(vars[i].name===name) {
            ifVar(json, name, i);
            return;
        }
    }
    if(json.expression.right.type==='ArrayExpression') {
        ifGlobal(name,json);
    }
    else {
        elseIfglobal(json,name);
    }
}

function parseReturnStatement(json){
    subString=subString.concat('return ').concat(getVal(json.argument)).concat(';\n');
}

function parseWhileStatement(json){
    let gibui = copyVars(vars);
    subString=subString.concat('while(').concat(getVal(json.test)).concat(')');
    if(json.body.type==='BlockStatement') {
        subString = subString.concat('{\n');
        parseb2(json.body.body);
        subString = subString.concat('}\n');
    }
    else {
        subString = subString.concat('\n');
        parseb2([json.body]);
    }
    vars=copyVars(gibui);
}

const  parseb2 =(body) =>{
    for(let i=0;i<body.length;i++){
        switch (body[i].type){
        case 'VariableDeclaration': parseb2(body[i].declarations);break;
        case  'VariableDeclarator': parseVariableDeclaration(body[i]); break;
        default: next(body[i]);
        }
    }
};

function next(body){
    switch(body.type){
    case 'WhileStatement': parseWhileStatement(body); break;
    case 'IfStatement': parseIfStatement(body); break;
    case 'ExpressionStatement': parseAssignmentExpression(body); break;
    case 'ReturnStatement': parseReturnStatement(body); break;
    }
}


function setStringCode(str){
    stringCode=str;
}

function getsubstring(){
    return subString;
}

function clean(){
    subString='';
    globals=[];
    vars=[];
    params=[];
    argument=[];
}

export {parseb,setArgs, setStringCode, getsubstring,clean};
