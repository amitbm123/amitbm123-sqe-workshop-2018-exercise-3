
import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true, range:true});
};

export {parseCode};


let arrayTable=[];
let stringCode='';

export {arrayTable};
export {stringCode};


function parsefunctionDeclaration(json) {
    let map = {line: json.loc.start.line, type: json.type, name: json.id.name, condition: '', value: ''};
    arrayTable.push(map);
    parseb(json.params);
    parseb(json.body.body);
}

function parseVariableDeclarationIdentifier(json){
    let map = {line: json.loc.start.line, type: 'VariableDeclaration', name: json.name, condition: '', value: ''};
    arrayTable.push(map);
}
function parseVariableDeclaration(json){
    if(json.init == null){
        let map = {line: json.loc.start.line, type: 'VariableDeclaration', name: json.id.name, condition: '', value: ''};
        arrayTable.push(map);
    }
    else{
        let val = stringCode.substring(json.init.range[0], json.init.range[1]);
        let map = {line: json.loc.start.line, type: 'VariableDeclaration', name: json.id.name, condition: '', value: val};
        arrayTable.push(map);
    }
}

function parseAssignmentExpression(json) {
    if(json.expression.type=='UpdateExpression'){
        let val=stringCode.substring(json.expression.range[0], json.expression.range[1]);
        let map = {line: json.expression.loc.start.line, type: 'AssignmentExpression', name: json.expression.argument.name, condition: '', value: val};
        arrayTable.push(map);
    }
    else {
        let left = stringCode.substring(json.expression.left.range[0], json.expression.left.range[1]);
        let right = stringCode.substring(json.expression.right.range[0], json.expression.right.range[1]);
        let map = {line: json.expression.loc.start.line,type: json.expression.type,name: left, condition: '',value: right};
        arrayTable.push(map);
    }
}

function parseWhileStatement(json){
    let con = stringCode.substring(json.test.range[0], json.test.range[1]);
    let map = {line: json.loc.start.line, type: json.type, name: '', condition: con, value: ''};
    arrayTable.push(map);
    if(json.body.type=='BlockStatement')
        parseb(json.body.body);
    else
        parseb([json.body]);
}

function parseIfStatement(json){
    let con = stringCode.substring(json.test.range[0], json.test.range[1]);
    let map = {line: json.loc.start.line, type: json.type, name: '', condition: con, value: ''};
    arrayTable.push(map);
    if(json.consequent.type=='BlockStatement')
        parseb(json.consequent.body);
    else
        parseb([json.consequent]);
    if(json.alternate!=null && json.alternate.type=='IfStatement')
        parseElseIfStatement(json.alternate);
    else if (json.alternate!=null)
        parseb([json.alternate]);
}
function parseElseIfStatement(json){
    let con = stringCode.substring(json.test.range[0], json.test.range[1]);
    let map = {line: json.loc.start.line, type: 'ElseIfStatement', name: '', condition: con, value: ''};
    arrayTable.push(map);
    if(json.consequent.type=='BlockStatement')
        parseb(json.consequent.body);
    else
        parseb([json.consequent]);
    if(json.alternate!=null && json.alternate.type=='IfStatement')
        parseElseIfStatement(json.alternate);
    else if (json.alternate!=null)
        parseb([json.alternate]);
}

function parseReturnStatement(json){
    let val = stringCode.substring(json.argument.range[0], json.argument.range[1]);
    let map = {line: json.loc.start.line, type: json.type, name: '', condition: '' , value: val};
    arrayTable.push(map);
}

function parseForStatement(json){
    let init = stringCode.substring(json.init.range[0], json.init.range[1]);
    let test = stringCode.substring(json.test.range[0], json.test.range[1]);
    let update = stringCode.substring(json.update.range[0], json.update.range[1]);
    let map = {line: json.loc.start.line, type: json.type, name: '', condition: init.concat(test).concat(';').concat(update) , value:'' };
    arrayTable.push(map);
    if(json.body.type=='BlockStatement')
        parseb(json.body.body);
    else
        parseb([json.body]);
}

const  parseb =(body) =>{
    for(let i=0;i<body.length;i++){
        switch (body[i].type){
        case 'FunctionDeclaration': parsefunctionDeclaration(body[i]); break;
        case 'Identifier':parseVariableDeclarationIdentifier(body[i]); break;
        case  'VariableDeclarator': parseVariableDeclaration(body[i]); break;
        default: next(body[i]);
        }
    }
}

function next(body){
    switch(body.type){
    case 'WhileStatement': parseWhileStatement(body); break;
    case 'IfStatement': parseIfStatement(body); break;
    case 'ForStatement':parseForStatement(body);break;
    case 'VariableDeclaration': parseb(body.declarations);break;
    default: next1(body);
    }
}

function next1(body){
    switch(body.type) {
    case 'ExpressionStatement': parseAssignmentExpression(body); break;
    case 'ReturnStatement': parseReturnStatement(body); break;
    }
}


function setStringCode(str){
    stringCode=str;
}
function cleanTable(x) {
    while(x.length > 0) {
        x.pop();
    }
}


function getStringTable(){
    let table = '';
    for(let i = 0; i<arrayTable.length; i++) {
        table += '<tr>';
        table += '<td>' + arrayTable[i].line + '</td>';
        table += '<td>' + arrayTable[i].type + '</td>';
        table += '<td>' + arrayTable[i].name + '</td>';
        table += '<td>' + arrayTable[i].condition + '</td>';
        table += '<td>' + arrayTable[i].value + '</td>';
        table += '</tr>';
    }
    return table;
}
export {parseb, setStringCode, cleanTable,getStringTable};
