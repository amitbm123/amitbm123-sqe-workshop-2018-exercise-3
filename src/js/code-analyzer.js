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
let params=[];

let defineNodes='';
let conections='';
let stringLetAss='';

let id=1;
let count = 0;
let flagIf=true;
//let flagtmp=true;
let flagWhiletmp=true;
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
            return false;
        }
    }
    return true;
}
function boundParams(){
    let flag1=true;
    for(let i=0;i<params.length;i++) {
        if (argument[i].charAt(0) === '[' && argument[i].charAt((argument[i].length - 1)) === ']') {
            arrayRec(argument[i], params[i]);
        }
        flag1=globalIsParam(i);
        if (flag1 === true) {
            globals.push({name: params[i], val: argument[i]});
        }
        else flag1 = true;

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

function addLetAss(){
    if(stringLetAss!==''){
        defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringLetAss).concat(' |true\n'));
        id=id+1;
        conections = conections.concat('->').concat(count);
        count=count+1;
        stringLetAss='';
    }
}
function parsefunctionDeclaration(json) {
    addLetAss();
    setParams(json.params);
    boundParams();
    parseb2(json.body.body);
}

function parseVariableDeclarationNext(json){
    stringLetAss=stringLetAss.concat(stringCode.substring(json.range[0],json.range[1])).concat('\n');
    if(json.init == null){
        let map = {name: json.id.name,val: ''};
        globals.push(map);
    } else {
        if (json.init.type === 'ArrayExpression') {
            let arr = '[';
            for (let i = 0; i < json.init.elements.length; i++) {
                globals.push({name: json.id.name.concat('[').concat(i.toString()).concat(']'), val: json.init.elements[i].raw});
                arr = arr.concat(json.init.elements[i].raw).concat(',');
            }
            arr = (arr.substring(0, arr.length - 1)).concat(']');
            globals.push({name: json.id.name, val: arr});
        } else {
            let map = {name: json.id.name, val: getGlobalVal(json.init)};
            globals.push(map);
        }}}


const  parseb =(body) =>{
    for(let i=0;i<body.length;i++){
        switch (body[i].type){
        case 'FunctionDeclaration': parsefunctionDeclaration(body[i]); break;
        case 'VariableDeclaration': parseb(body[i].declarations);break;
        case  'VariableDeclarator': parseVariableDeclarationNext(body[i]); break;
        }
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
    stringLetAss=stringLetAss.concat(stringCode.substring(json.range[0],json.range[1])).concat('\n');
    if(json.init == null){
        let map = {name: json.id.name,val: ''};
        vars.push(map);
    } else{
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
        }}
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

function checkCond(json){
    return json.consequent.type === 'BlockStatement' && json.consequent.body.length === 1 && json.consequent.body[0].type === 'IfStatement';
}
function checkThen(json, circleCount) {
    if (checkCond(json))
        recIf(json.consequent.body[0], circleCount);
    else if (json.consequent.type === 'BlockStatement')
        parseb2(json.consequent.body);
    else if (json.consequent.type !== 'BlockStatement' && json.consequent.type === 'IfStatement')
        recIf(json.consequent, circleCount);
    else/* if (json.consequent.type !== 'BlockStatement')*/
        parseb2([json.consequent]);

}
function checkLetAss(){
    if(stringLetAss!==''){
        if(flagIf)
            defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringLetAss).concat(' |true\n'));
        else
            defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringLetAss).concat('\n'));
        conections = conections.concat('->').concat(count);
        count=count+1;
        stringLetAss='';
        id=id+1;
    }
}

function colorCondition(json){
    if(flagIf)
        defineNodes = defineNodes.concat(count).concat('=>condition: '.concat('-').concat(id).concat('-\n').concat(stringCode.substring(json.test.range[0],json.test.range[1])).concat(' |true\n'));
    else
        defineNodes = defineNodes.concat(count).concat('=>condition: '.concat('-').concat(id).concat('-\n').concat(stringCode.substring(json.test.range[0],json.test.range[1])).concat('\n'));
    id=id+1;
    conections = conections.concat('->').concat(count).concat('->\n');

}

function checkFlagtmp(flagtmp){
    if(flagtmp)
        defineNodes = defineNodes.concat(count).concat('=>start: hi'.concat('|true\n'));
    else
        defineNodes = defineNodes.concat(count).concat('=>start: hi'.concat('\n'));
}

function colorMerge(json, flagtmp){
    if(flagIf)
        defineNodes = defineNodes.concat(count).concat('=>start: hi'.concat('|true\n'));
    else
        checkFlagtmp(flagtmp);

}

function checkElse(json,circleCount){
    if (json.alternate != null )
        if(json.alternate.type === 'BlockStatement')
            recAndBlock(json,circleCount);
        else{
            if(json.alternate.type!=='IfStatement')
                parseb2([json.alternate]);
            else
                recIf(json.alternate,circleCount);
        }
}
function recAndBlock(json,circleCount){
    if(json.alternate.body.length!==1 || json.alternate.body[0].type!=='IfStatement')
        parseb2(json.alternate.body);
    else
        recIf(json.alternate.body[0],circleCount);
}
function parseIfStatement(json){
    let gibui = copyVars(vars);
    let gibui2 = copyVars(globals);
    checkLetAss();
    colorCondition(json);
    let condNum=count;
    count=count+1;
    let flagtmp=flagIf;
    checkFlagAndMerge(json,flagtmp);
    let circleCount=count;
    count=count+1;
    checkCondThen(json, condNum, circleCount, gibui, gibui2);
    if(flagtmp) flagIf=!flagIf;
    checkElse(json,circleCount);
    checkLetAss();
    conections = conections.concat('->').concat(circleCount).concat('\n').concat(circleCount);
    flagIf=flagtmp;
    vars = copyVars(gibui);
    globals = copyVars(gibui2);
}

function checkFlagAndMerge(json,flagtmp){
    if(flagIf)
        flagIf=(eval(updateGlobals(getVal(json.test)))===true);
    colorMerge(json,flagtmp);
}

function checkCondThen(json, condNum, circleCount, gibui, gibui2){
    conections = conections.concat(condNum).concat('(yes)');
    checkThen(json, circleCount);
    checkLetAss();
    conections = conections.concat('->').concat(circleCount).concat('\n');
    vars = copyVars(gibui);
    globals = copyVars(gibui2);
    conections = conections.concat(condNum).concat('(no)');
}

function recIf(json,circleCount){
    let gibui = copyVars(vars);
    let gibui2 = copyVars(globals);
    checkLetAss();
    colorCondition(json);
    let condNum=count;
    count=count+1;
    let flagtmp2=flagIf;
    if(flagIf)
        flagIf=(eval(updateGlobals(getVal(json.test)))===true);
    checkCondThen(json, condNum, circleCount, gibui, gibui2);
    if(flagtmp2)
        flagIf=!flagIf;
    checkElse(json,circleCount);
    checkLetAss();
    conections = conections.concat('->').concat(circleCount).concat('\n').concat(circleCount);
    flagIf=flagtmp2;
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
    for (let i = 0; i < globals.length; i++) {
        if (globals[i].name === name) {
            globals[i].val = updateGlobals(getVal(json.expression.right));
        }
    }
}
function parseAssignmentExpression(json) {
    let name=  stringCode.substring(json.expression.left.range[0], json.expression.left.range[1]);
    stringLetAss=stringLetAss.concat(stringCode.substring(json.range[0],json.range[1]-1)).concat('\n');
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
    if(stringLetAss!==''){
        if(flagIf)
            defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringLetAss).concat(' |true\n'));
        else
            defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringLetAss).concat('\n'));
        conections = conections.concat('->').concat(count);
        id=id+1;
        count=count+1;
        stringLetAss='';
    }
    if(flagIf)
        defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringCode.substring(json.range[0],json.range[1]-1)).concat(' |true\n'));
    else
        defineNodes = defineNodes.concat(count).concat('=>operation: '.concat('-').concat(id).concat('-\n').concat(stringCode.substring(json.range[0],json.range[1]-1)).concat('\n'));
    conections = conections.concat('->').concat(count);
    count=count+1;
    id=id+1;
}

function parseWhileStatement(json){
    let gibui = copyVars(vars);
    checkLetAss();
    let circleWhileCount=count;
    if(flagIf)
        defineNodes = defineNodes.concat(count).concat('=>start: hi'.concat('|true\n'));
    else
        defineNodes = defineNodes.concat(count).concat('=>start: hi'.concat('\n'));
    conections = conections.concat('->').concat(count);
    count=count+1;
    let condCount=count;
    conections = conections.concat('->').concat(count).concat('\n').concat(count).concat('(yes)');
    if(flagIf)
        defineNodes = defineNodes.concat(count).concat('=>condition: '.concat('-').concat(id).concat('-\n').concat(stringCode.substring(json.test.range[0],json.test.range[1])).concat('|true\n'));
    else
        defineNodes = defineNodes.concat(count).concat('=>condition: '.concat('-').concat(id).concat('-\n').concat(stringCode.substring(json.test.range[0],json.test.range[1])).concat('\n'));
    count=count+1;
    id=id+1;
    continueWhile(json, circleWhileCount, condCount, gibui);
}
function continueWhile(json, circleWhileCount, condCount, gibui){
    flagWhiletmp=flagIf;
    if(flagIf)
        flagIf=(eval(updateGlobals(getVal(json.test)))===true);
    if (json.body.type !== 'BlockStatement') {
        parseb2([json.body]);
    }
    else {
        parseb2(json.body.body);
    }
    checkLetAss();
    conections = conections.concat('->').concat(circleWhileCount).concat('\n').concat(condCount).concat('(no)');
    flagIf=flagWhiletmp;
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
/*function getGreenNodes(){
    return greenNodes;
}
*/
function getConections() {
    return conections.substring(2);
}
function getDefineNodes(){
    return defineNodes;
}

function clean(){
    conections='';
    stringLetAss='';
    defineNodes='';
    globals=[];
    vars=[];
    params=[];
    argument=[];
    id=1;
    count = 0;
    flagIf=true;
    flagWhiletmp=true;
}

export {parseb,setArgs, setStringCode,getConections,getDefineNodes,clean};







