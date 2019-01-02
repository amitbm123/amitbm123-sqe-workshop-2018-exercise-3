import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import { stringCode} from '../src/js/code-analyzer';
import {setStringCode} from '../src/js/code-analyzer';
import {parseb} from '../src/js/code-analyzer';
import {clean,setArgs,getConections,getDefineNodes} from '../src/js/code-analyzer';

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


it('check if',()=>{
    setStringCode('function foo(){\nif(1==1)\nreturn 1;\nif(1==2)\nreturn 1;\n}');
    parseb(parseCode('function foo(){\nif(1==1)\nreturn 1;\nif(1==2)\nreturn 1;\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>condition: -1-\n1==1 |true\n1=>start: hi|true\n2=>operation: -2-\nreturn 1 |true\n3=>condition: -3-\n1==2 |true\n4=>start: hi|true\n5=>operation: -4-\nreturn 1\n\n0->\n0(yes)->2->1\n0(no)'+
        '->1\n1->3->\n3(yes)->5->4\n3(no)->4\n4');
    clean();
});

it('check if true false',()=>{
    setStringCode('function foo(){\nif(1==1)\nreturn 1;\nif(1==2)\nreturn 1;\n}');
    parseb(parseCode('function foo(){\nif(1==1)\nreturn 1;\nif(1==2)\nreturn 1;\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>condition: -1-\n1==1 |true\n1=>start: hi|true\n2=>operation: -2-\nreturn 1 |true\n3=>condition: -3-\n1==2 |true\n4=>start: hi|true\n5=>operation: -4-\nreturn 1\n\n0->\n0(yes)->2->1\n0(no)'+
        '->1\n1->3->\n3(yes)->5->4\n3(no)->4\n4');
    clean();
});

it('check params',()=>{
    setStringCode('function foo(x,y,z){\n' +
        'while(1==1)\n' +
        'return x;\n' +
        '}');
    setArgs('1 2 3');
    parseb(parseCode('function foo(x,y,z){\n' +
        'while(1==1)\n' +
        'return x;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>start: hi|true\n1=>condition: -1-\n1==1|true\n2=>operation: -2-\nreturn x |true\n\n0->1\n1(yes)->2->0\n1(no)');
    clean();
});



it('check while true',()=>{
    setStringCode('function foo(x){\n' +
        'while(1 == 1)\n' +
        'return x;\n' +
        '}\n');
    setArgs('1');
    parseb(parseCode('function foo(x){\n' +
        'while(1 == 1)\n' +
        'return x;\n' +
        '}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>start: hi|true\n1=>condition: -1-\n1 == 1|true\n2=>operation: -2-\nreturn x |true\n\n0->1\n1(yes)->2->0\n1(no)');
    clean();
});


it('check while false',()=>{
    setStringCode('function foo(x, y, z){\n' +
        'while(false)\n' +
        'return x;\n' +
        '}\n');
    setArgs('1 2 3');
    parseb(parseCode('function foo(x, y, z){\n' +
        'while(false)\n' +
        'return x;\n' +
        '}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>start: hi|true\n1=>condition: -1-\nfalse|true\n2=>operation: -2-\nreturn x\n\n0->1\n1(yes)->2->0\n1(no)');
    clean();
});

it('check declaration array globals vars',()=>{
    setStringCode('function foo(x, y, z){\n' +
        'let a = x[1];\n' +
        'let b = a + 1;\n' +
        'let c = y + b;\n' +
        'return 1;}\n');
    setArgs('[1,2] 1 2');
    parseb(parseCode('function foo(x, y, z){\n' +
        'let a = x[1];\n' +
        'let b = a + 1;\n' +
        'let c = y + b;\n' +
        'return 1;}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\na = x[1]\nb = a + 1\nc = y + b\n |true\n1=>operation: -2-\nreturn 1 |true\n\n0->1');
    clean();
});

it('check assingment array globals vars',()=>{
    setStringCode('function foo(x, y, z){\nlet a = x[1];\na = a + 1;\nlet b = 1;\n' +
        'a = a + b + y;\nif(a == 5)\nreturn 2;\n' +
        '}\n');
    setArgs('[1,2] 1 2');
    parseb(parseCode('function foo(x, y, z){\nlet a = x[1];\na = a + 1;\n' +
        'let b = 1;\na = a + b + y;\nif(a == 5)\n' +
        'return 2;\n' +
        '}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\na = x[1]\na = a + 1\nb = 1\na = a + b + y\n |true\n1=>condition: -2-\na == 5 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn 2 |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2');
    clean();
});


it('check globals declaration',()=>{
    setStringCode('let x = [1,2];\nlet y = x[1];\nlet c = 1;\n' +
        'function foo(){\n' +
        'return 2;\n' +
        '}\n');
    setArgs('');
    parseb(parseCode('let x = [1,2];\nlet y = x[1];\n' +
        'let c = 1;\n' +
        'function foo(){\n' +
        'return 2;\n' +
        '}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()), '0=>operation: -1-\nx = [1,2]\ny = x[1]\nc = 1\n |true\n1=>operation: -2-\nreturn 2 |true\n\n0->1');
    clean();
});


it('check if inside if',()=>{
    setStringCode('function foo(x, y){\nif(x == 1){\n' +
        'let a = 1;\nif(a == 1)\na = y[0];\n' +
        'else\na = y[1];\n}\n' +
        'return 2;\n}\n');
    setArgs('1 [1,2]');
    parseb(parseCode('function foo(x, y){\n' +
        'if(x == 1){\nlet a = 1;\n' +
        'if(a == 1)\na = y[0];\n' +
        'else\na = y[1];\n}\n' +
        'return 2;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>condition: -1-\nx == 1 |true\n1=>start: hi|true\n2=>operation: -2-\na = 1\n |true\n3=>condition: -3-\na == 1 |true\n4=>start: hi|true\n5=>operation: -4-\na = y[0]\n |true\n6=>operation: -'+
        '5-\na = y[1]\n\n7=>operation: -6-\nreturn 2 |true\n\n0->\n0(yes)->2->3->\n3(yes)->5->4\n3(no)->6->4\n4->1\n0(no)->1\n1->7');
    clean();
});




it('check assignment of array',()=>{
    setStringCode('function foo(x, y, z){\n' +
        '    let a = [1,2];\n' +
        ' if(a[0] == 1) \n' +
        'return 1;\n' +
        '}');
    setArgs('1 2 3');
    parseb(parseCode('function foo(x, y, z){\n' +
        '    let a = [1,2];\n' +
        ' if(a[0] == 1) \n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\na = [1,2]\n |true\n1=>condition: -2-\na[0] == 1 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn 1 |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2');
    clean();
});


it('check while block',()=>{
    setStringCode('function foo(x, y, z){\n' +
        'while(x == 1){\n' +
        'x = x + 1;\n' +
        '}\n' +
        '}');
    setArgs('1 2 3');
    parseb(parseCode('function foo(x, y, z){\n' +
        'while(x == 1){\n' +
        'x = x + 1;\n' +
        '}\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>start: hi|true\n1=>condition: -1-\nx == 1|true\n2=>operation: -2-\nx = x + 1\n |true\n\n0->1\n1(yes)->2->0\n1(no)');
    clean();
});


it('check let without value',()=>{
    setStringCode('let p;\n' +
        'function foo(x, y, z){\n' +
        'let a;\na = 0;\np = 0;\n' +
        'if(p == a){\nreturn 1;\n}\n}');
    setArgs('1 2 3');
    parseb(parseCode('let p;\n' +
        'function foo(x, y, z){\n' +
        'let a;\na = 0;\np = 0;\n' +
        'if(p == a){\nreturn 1;\n}\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\np\n |true\n1=>operation: -2-\na\na = 0\np = 0\n |true\n2=>condition: -3-\np == a |true\n3=>start: hi|true\n4=>operation: -4-\nreturn 1 |true\n\n0->1->2->\n2(yes)->4->3\n2('+
        'no)->3\n3');
    clean();
});


it('check global is param',()=>{
    setStringCode('let p = 2;\n' +
        'function foo(p){\nif(p == 1){\n' +
        'return 1;\n}\n}');
    setArgs('1');
    parseb(parseCode('let p = 2;\n' +
        'function foo(p){\nif(p == 1){\n' +
        'return 1;\n}\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\np = 2\n |true\n1=>condition: -2-\np == 1 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn 1 |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2');
    clean();
});


it('check assignment array',()=>{
    setStringCode('function foo(p){\n' +
        'let a = 1;\n' +
        'a = [1,2];\n' +
        'if(a[0] == 1){\n' +
        'return 1;\n}\n}');
    setArgs('1');
    parseb(parseCode('function foo(p){\n' +
        'let a = 1;\n' +
        'a = [1,2];\n' +
        'if(a[0] == 1){\n' +
        'return 1;\n}\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()), '0=>operation: -1-\na = 1\na = [1,2]\n |true\n1=>condition: -2-\na[0] == 1 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn 1 |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2');
    clean();
});


it('array in array',()=>{
    setStringCode('function foo(x){\n' +
        'if(x[0]==1)\n' +
        'return x;\n' +
        '}');
    setArgs('[1,[1]]');
    parseb(parseCode('function foo(x){\n' +
        'if(x[0]==1)\n' +
        'return x;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>condition: -1-\nx[0]==1 |true\n1=>start: hi|true\n2=>operation: -2-\nreturn x |true\n\n0->\n0(yes)->2->1\n0(no)->1\n1');
    clean();
});


it('global identifier',()=>{
    setStringCode('let x = 1;\n' +
        'let y = x;\n' +
        'function foo(){\n' +
        ' return x;\n' +
        '}');
    setArgs('[1,[1]]');
    parseb(parseCode('let x = 1;\n' +
        'let y = x;\n' +
        'function foo(){\n' +
        ' return x;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx = 1\ny = x\n |true\n1=>operation: -2-\nreturn x |true\n\n0->1');
    clean();
});


it('global binary',()=>{
    setStringCode('let c = 2;\n' +
        'let x = 1 + 2;\n' +
        'let y = x;\n' +
        'function foo(){\n' +
        ' return x;\n}');
    setArgs('[1,[1]]');
    parseb(parseCode('let c = 2;\n' +
        'let x = 1 + 2;\n' +
        'let y = x;\n' +
        'function foo(){\n' +
        ' return x;\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nc = 2\nx = 1 + 2\ny = x\n |true\n1=>operation: -2-\nreturn x |true\n\n0->1');
    clean();
});


it('check array with globals and var',()=>{
    setStringCode('function foo(x, y){\n' +
        'let a = 0;\n' +
        ' if(x[a] == 1)\n' +
        '   return true;\n' +
        'if(x[y] == 2)\n' +
        ' return false;\n' +
        '}');
    setArgs('[1,2] 1');
    parseb(parseCode('function foo(x, y){\n' +
        'let a = 0;\n' +
        ' if(x[a] == 1)\n' +
        '   return true;\n' +
        'if(x[y] == 2)\n' +
        ' return false;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\na = 0\n |true\n1=>condition: -2-\nx[a] == 1 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn true |true\n4=>condition: -4-\nx[y] == 2 |true\n5=>start: hi|true\n6=>opera'+
        'tion: -5-\nreturn false |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2->4->\n4(yes)->6->5\n4(no)->5\n5');
    clean();
});


it('check else block',()=>{
    setStringCode('function foo(x, y){\n' +
        'if(1 == 2)\nreturn x;\n' +
        'else{\nif(1 == 3)\n' +
        'return 1;\nelse\n' +
        'return y;\n}\n}');
    setArgs('1 2');
    parseb(parseCode('function foo(x, y){\n' +
        'if(1 == 2)\n' +
        'return x;\n' +
        'else{\n' +
        'if(1 == 3)\n' +
        'return 1;\n' +
        'else\n' +
        'return y;\n' +
        '}\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>condition: -1-\n1 == 2 |true\n1=>start: hi|true\n2=>operation: -2-\nreturn x\n3=>condition: -3-\n1 == 3 |true\n4=>operation: -4-\nreturn 1\n5=>operation: -5-\nreturn y |true\n\n0->\n0(yes'+
        ')->2->1\n0(no)->3->\n3(yes)->4->1\n3(no)->5->1\n1->1\n1');
    clean();
});


it('check array assingment',()=>{
    setStringCode('function foo(x, y){\n' +
        'x = [1,2];\n' +
        'let a;\n' +
        'a = [1,2];\n' +
        'if(a[0] == x[0])\n' +
        'return true;\n' +
        '}');
    setArgs('1 2');
    parseb(parseCode('function foo(x, y){\n' +
        'x = [1,2];\n' +
        'let a;\n' +
        'a = [1,2];\n' +
        'if(a[0] == x[0])\n' +
        'return true;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()), '0=>operation: -1-\nx = [1,2]\na\na = [1,2]\n |true\n1=>condition: -2-\na[0] == x[0] |true\n2=>start: hi|true\n3=>operation: -3-\nreturn true |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2');
    clean();
});


it('check local is var of local array',()=>{
    setStringCode('function foo(x){\n' +
        'let a = [1,2];\n' +
        'let c = a[x];\n' +
        'if(c == 1)\n' +
        'return x;\n' +
        '}');
    setArgs('0');
    parseb(parseCode('function foo(x){\n' +
        'let a = [1,2];\n' +
        'let c = a[x];\n' +
        'if(c == 1)\n' +
        'return x;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\na = [1,2]\nc = a[x]\n |true\n1=>condition: -2-\nc == 1 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn x |true\n\n0->1->\n1(yes)->3->2\n1(no)->2\n2');
    clean();
});


it('check if rec',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'if(x==1)\nreturn 1;\n' +
        'else\nreturn 2;\n}\n' +
        'else return 3;\n' +
        'return 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'if(x==1)\n' +
        'return 1;\n' +
        'else\nreturn 2;\n' +
        '}\nelse return 3;\n' +
        'return 4;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>condition: -3-\nx==1\n4=>operation: -4-\nreturn 1\n5=>operation: -5-\nreturn 2\n6=>operation: -6-\nreturn'+
        ' 3 |true\n7=>operation: -7-\nreturn 4 |true\n\n0->1->\n1(yes)->3->\n3(yes)->4->2\n3(no)->5->2\n2->2\n1(no)->6->2\n2->7');
    clean();
});



it('check if 2 rec',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'if(x==1){\nif(x==0)\n' +
        'return 1;\n}\n' +
        'else\nreturn 2;\n' +
        '}\nelse return 3;\n' +
        'return 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'if(x==1){\nif(x==0)\n' +
        'return 1;\n}\n' +
        'else\nreturn 2;\n' +
        '}\nelse return 3;\n' +
        'return 4;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>condition: -3-\nx==1\n4=>condition: -4-\nx==0\n5=>operation: -5-\nreturn 1\n6=>operation: -6-\nreturn 2\n'+
        '7=>operation: -7-\nreturn 3 |true\n8=>operation: -8-\nreturn 4 |true\n\n0->1->\n1(yes)->3->\n3(yes)->4->\n4(yes)->5->2\n4(no)->2\n2->2\n3(no)->6->2\n2->2\n1(no)->7->2\n2->8');
    clean();
});

it('check else rec',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'return 2;\n}\n' +
        'else if(x==1)\n{\n' +
        'if(x==0)\n return 3;\n' +
        'else\nreturn 5;\n' +
        '}\nreturn 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'return 2;\n}\n' +
        'else if(x==1)\n{\n' +
        'if(x==0)\n return 3;\n' +
        'else\nreturn 5;\n' +
        '}\nreturn 4;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()), '0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>operation: -3-\nreturn 2\n4=>condition: -4-\nx==1 |true\n5=>condition: -5-\nx==0 |true\n6=>operation: -6-'+
        '\nreturn 3\n7=>operation: -7-\nreturn 5 |true\n8=>operation: -8-\nreturn 4 |true\n\n0->1->\n1(yes)->3->2\n1(no)->4->\n4(yes)->5->\n5(yes)->6->2\n5(no)->7->2\n2->2\n4(no)->2\n2->2\n2->8');
    clean();
});

it('if in while',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nwhile(x==2){\n' +
        'if(x==1){\nreturn 1;\n' +
        '}\nelse\n' +
        'return 2;\n}\n' +
        'return 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nwhile(x==2){\n' +
        'if(x==1){\nreturn 1;\n' +
        '}\nelse\n' +
        'return 2;\n}\n' +
        'return 4;\n' +
        '}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),  '0=>operation: -1-\nx=1\n |true\n1=>start: hi|true\n2=>condition: -2-\nx==2|true\n3=>condition: -3-\nx==1\n4=>start: hi\n5=>operation: -4-\nreturn 1\n6=>operation: -5-\nreturn 2\n7=>operation'+
        ': -6-\nreturn 4 |true\n\n0->1->2\n2(yes)->3->\n3(yes)->5->4\n3(no)->6->4\n4->1\n2(no)->7');
    clean();
});


it('if rec not block',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2)\n' +
        'if(x==1){\nreturn 1;}\n' +
        'else{\nreturn 2;}\n' +
        'else{ return 3;}\n' +
        'return 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nif(x==2)\n' +
        'if(x==1){\nreturn 1;}\n' +
        'else{\nreturn 2;}\n' +
        'else{ return 3;}\n' +
        'return 4;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()), '0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>condition: -3-\nx==1\n4=>operation: -4-\nreturn 1\n5=>operation: -5-\nreturn 2\n6=>operation: -6-\nreturn'+
        ' 3 |true\n7=>operation: -7-\nreturn 4 |true\n\n0->1->\n1(yes)->3->\n3(yes)->4->2\n3(no)->5->2\n2->2\n1(no)->6->2\n2->7');
    clean();
});


it('check if 2 rec with block',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'if(x==1){\nif(x==0){\n' +
        'return 1;}\n}\nelse\n' +
        'return 2;\n}\n' +
        'else return 3;\n' +
        'return 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nif(x==2){\n' +
        'if(x==1){\nif(x==0){\n' +
        'return 1;}\n}\n' +
        'else\nreturn 2;\n' +
        '}\nelse return 3;\n' +
        'return 4;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>condition: -3-\nx==1\n4=>condition: -4-\nx==0\n5=>operation: -5-\nreturn 1\n6=>operation: -6-\nreturn 2\n'+
        '7=>operation: -7-\nreturn 3 |true\n8=>operation: -8-\nreturn 4 |true\n\n0->1->\n1(yes)->3->\n3(yes)->4->\n4(yes)->5->2\n4(no)->2\n2->2\n3(no)->6->2\n2->2\n1(no)->7->2\n2->8');
    clean();
});



it('check if 2 rec no block',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2)\n' +
        'if(x==1)\nif(x==0)\n' +
        'return 1;\n' +
        'return 4;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\n' +
        'if(x==2)\n' +
        'if(x==1)\n' +
        'if(x==0)\n' +
        'return 1;\n' +
        'return 4;\n' +
        '}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>condition: -3-\nx==1\n4=>condition: -4-\nx==0\n5=>operation: -5-\nreturn 1\n6=>operation: -6-\nreturn 4 |'+
        'true\n\n0->1->\n1(yes)->3->\n3(yes)->4->\n4(yes)->5->2\n4(no)->2\n2->2\n3(no)->2\n2->2\n1(no)->2\n2->6');
    clean();
});

it('check else send to rec if',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\nif(x==2)\n' +
        'if(x==1)\nif(x==0)\n' +
        'return 1;\nelse{\n' +
        'if(x==3)\nreturn 1;\n}\nelse\n' +
        'if(x==4)\nreturn 4;\nreturn 5;\n}\n');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\nif(x==2)\n' +
        'if(x==1)\nif(x==0)\n' +
        'return 1;\nelse{\n' +
        'if(x==3)\nreturn 1;\n' +
        '}\nelse\nif(x==4)\n' +
        'return 4;\nreturn 5;\n}\n').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>condition: -3-\nx==1\n4=>condition: -4-\nx==0\n5=>operation: -5-\nreturn 1\n6=>condition: -6-\nx==3\n7=>o'+
        'peration: -7-\nreturn 1\n8=>condition: -8-\nx==4\n9=>operation: -9-\nreturn 4\n10=>operation: -10-\nreturn 5 |true\n\n0->1->\n1(yes)->3->\n3(yes)->4->\n4(yes)->5->2\n4(no)->6->\n6(yes)->7->2\n6(no)->2\n2->2\n2'+
        '->2\n3(no)->8->\n8(yes)->9->2\n8(no)->2\n2->2\n2->2\n1(no)->2\n2->10');
    clean();
});


it('check else send to rec if',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\n' +
        'if(x==2)\n' +
        'while(x==1)\n' +
        'return 1;\n' +
        'return 2;\n' +
        '}');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\n' +
        'if(x==2)\n' +
        'while(x==1)\n' +
        'return 1;\n' +
        'return 2;\n' +
        '}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>start: hi\n4=>condition: -3-\nx==1\n5=>operation: -4-\nreturn 1\n6=>operation: -5-\nreturn 2 |true\n\n0->'+
        '1->\n1(yes)->3->4\n4(yes)->5->3\n4(no)->2\n1(no)->2\n2->6');
    clean();
});

it('check let ass not greem',()=>{
    setStringCode('function foo(){\n' +
        'let x=1;\n' +
        'if(x==2){\n' +
        'x=x+1;\n' +
        'return x;\n}\n' +
        'return 2;\n}');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let x=1;\n' +
        'if(x==2){\n' +
        'x=x+1;\n' +
        'return x;\n}\n' +
        'return 2;\n}').body);
    assert.equal(getDefineNodes().concat('\n').concat(getConections()),'0=>operation: -1-\nx=1\n |true\n1=>condition: -2-\nx==2 |true\n2=>start: hi|true\n3=>operation: -3-\nx=x+1\n\n4=>operation: -4-\nreturn x\n5=>operation: -5-\nreturn 2 |true\n\n0->1->\n1(yes)'+
        '->3->4->2\n1(no)->2\n2->5');
    clean();
});