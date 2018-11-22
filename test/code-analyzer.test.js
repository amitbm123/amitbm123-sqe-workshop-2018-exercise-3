import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {arrayTable, stringCode} from '../src/js/code-analyzer';
import {setStringCode} from '../src/js/code-analyzer';
import {parseb} from '../src/js/code-analyzer';
import {cleanTable,getStringTable} from '../src/js/code-analyzer';

it('is parsing an empty function correctly', () => {
    assert.equal(
        JSON.stringify(parseCode('')),
        '{"type":"Program","body":[],"sourceType":"script","range":[0,0],"loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
    );
});

it('setStringCode', () => {
    setStringCode('hello');
    assert.equal(stringCode,'hello');
});

it('clean table', () => {
    let x=[2,3,4];
    assert.equal(x[0],'2');
    assert.equal(x[1],'3');
    assert.equal(x[2],'4');
    cleanTable(x);
    assert.equal(x,'');
});

it('while statement getStringTable', () => {
    setStringCode('while ( low <= high ){}');
    parseb(parseCode('while ( low <= high ){}').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: WhileStatement, name: , condition: low <= high, value: }');
    assert.equal(getStringTable(),'<tr><td>1</td><td>WhileStatement</td><td></td><td>low <= high</td><td></td></tr>');
    cleanTable(arrayTable);
});

it('for statement VariableDeclaration', () => {
    cleanTable(arrayTable);
    setStringCode('for ( let i=0; i<10; i++ ){let x = 1}');
    parseb(parseCode('for ( let i=0; i<10; i++ ){let x = 1}').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: ForStatement, name: , condition: let i=0;i<10;i++, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 1, type: VariableDeclaration, name: x, condition: , value: 1}');
});

it('IfStatement  AssignmentExpression', () => {
    cleanTable(arrayTable);
    setStringCode('if(x==1)\nI = I+1;\nelse if (x==0)\nI=I-1;\nelse\nI=0;');
    parseb(parseCode('if(x==1)\nI = I+1;\nelse if (x==0)\nI=I-1;\nelse\nI=0;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: IfStatement, name: , condition: x==1, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: I, condition: , value: I+1}');
    assert.equal(tostring(arrayTable[2]),'{line: 3, type: ElseIfStatement, name: , condition: x==0, value: }');
    assert.equal(tostring(arrayTable[3]),'{line: 4, type: AssignmentExpression, name: I, condition: , value: I-1}');
    assert.equal(tostring(arrayTable[4]),'{line: 6, type: AssignmentExpression, name: I, condition: , value: 0}');
});

it('ReturnStatement FunctionDeclaration identifier', () => {
    cleanTable(arrayTable);
    setStringCode('function binarySearch(X, V, n){\nreturn -1;\n}');
    parseb(parseCode('function binarySearch(X, V, n){\nreturn -1;\n}').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: FunctionDeclaration, name: binarySearch, condition: , value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 1, type: VariableDeclaration, name: X, condition: , value: }');
    assert.equal(tostring(arrayTable[2]),'{line: 1, type: VariableDeclaration, name: V, condition: , value: }');
    assert.equal(tostring(arrayTable[3]),'{line: 1, type: VariableDeclaration, name: n, condition: , value: }');
    assert.equal(tostring(arrayTable[4]),'{line: 2, type: ReturnStatement, name: , condition: , value: -1}');
});
it('VariableDeclaration', () => {
    cleanTable(arrayTable);
    setStringCode('let mid, high, low;');
    parseb(parseCode('let mid, high, low;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: VariableDeclaration, name: mid, condition: , value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 1, type: VariableDeclaration, name: high, condition: , value: }');
    assert.equal(tostring(arrayTable[2]),'{line: 1, type: VariableDeclaration, name: low, condition: , value: }');
});
it('for no block', () => {
    cleanTable(arrayTable);
    setStringCode('for (let I=0; I<10; I++)\nx=x+1;');
    parseb(parseCode('for (let I=0; I<10; I++)\nx=x+1;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: ForStatement, name: , condition: let I=0;I<10;I++, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: x, condition: , value: x+1}');
});


it('else with block', () => {
    cleanTable(arrayTable);
    setStringCode('if(x==0)\n x=x+1;\nelse if(x==1){\nx=x+1;\nx=x+1;\n}');
    parseb(parseCode('if(x==0)\n x=x+1;\nelse if(x==1){\nx=x+1;\nx=x+1;\n}').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: IfStatement, name: , condition: x==0, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: x, condition: , value: x+1}');
    assert.equal(tostring(arrayTable[2]),'{line: 3, type: ElseIfStatement, name: , condition: x==1, value: }');
    assert.equal(tostring(arrayTable[3]),'{line: 4, type: AssignmentExpression, name: x, condition: , value: x+1}');
    assert.equal(tostring(arrayTable[4]),'{line: 5, type: AssignmentExpression, name: x, condition: , value: x+1}');
});

it('while without block', () => {
    cleanTable(arrayTable);
    setStringCode('while (I <10)\nI=I+1;');
    parseb(parseCode('while (I <10)\nI=I+1;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: WhileStatement, name: , condition: I <10, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: I, condition: , value: I+1}');
});

it('elseif twice', () => {
    cleanTable(arrayTable);
    setStringCode('if(x==0)\nx=0;\nelse if(false)\nx=-1;\nelse if(true)\nx=2;');
    parseb(parseCode('if(x==0)\nx=0;\nelse if(false)\nx=-1;\nelse if(true)\nx=2;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: IfStatement, name: , condition: x==0, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: x, condition: , value: 0}');
    assert.equal(tostring(arrayTable[2]),'{line: 3, type: ElseIfStatement, name: , condition: false, value: }');
    assert.equal(tostring(arrayTable[3]),'{line: 4, type: AssignmentExpression, name: x, condition: , value: -1}');
    assert.equal(tostring(arrayTable[4]),'{line: 5, type: ElseIfStatement, name: , condition: true, value: }');
    assert.equal(tostring(arrayTable[5]),'{line: 6, type: AssignmentExpression, name: x, condition: , value: 2}');
});

it('if block else ', () => {
    cleanTable(arrayTable);
    setStringCode('if(true){\nx=x+1;\nx=x+1;\n}\nelse\nx=x-1;');
    parseb(parseCode('if(true){\nx=x+1;\nx=x+1;\n}\nelse\nx=x-1;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: IfStatement, name: , condition: true, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: x, condition: , value: x+1}');
    assert.equal(tostring(arrayTable[2]),'{line: 3, type: AssignmentExpression, name: x, condition: , value: x+1}');
    assert.equal(tostring(arrayTable[3]),'{line: 6, type: AssignmentExpression, name: x, condition: , value: x-1}');
});

it('if without else', () => {
    cleanTable(arrayTable);
    setStringCode('if (x==0)\nx=1;');
    parseb(parseCode('if (x==0)\nx=1;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: IfStatement, name: , condition: x==0, value: }');
    assert.equal(tostring(arrayTable[1]),'{line: 2, type: AssignmentExpression, name: x, condition: , value: 1}');
});


it('x++', () => {
    cleanTable(arrayTable);
    setStringCode('x++;');
    parseb(parseCode('x++;').body);
    assert.equal(tostring(arrayTable[0]),'{line: 1, type: AssignmentExpression, name: x, condition: , value: x++}');
});



function tostring(arr){
    return '{line: '+arr.line+', type: '+arr.type+', name: '+arr.name+', condition: '+arr.condition+', value: '+arr.value+'}';
}