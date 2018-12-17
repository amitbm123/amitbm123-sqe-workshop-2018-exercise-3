import assert from 'assert';
import {parseCode, setArgs} from '../src/js/code-analyzer';
import { stringCode} from '../src/js/code-analyzer';
import {setStringCode} from '../src/js/code-analyzer';
import {parseb} from '../src/js/code-analyzer';
import {clean,getsubstring} from '../src/js/code-analyzer';

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
    assert.equal(getsubstring(), 'function foo(){\n<mark class="green" id="green"> if(( 1 == 1 ))</mark> \nreturn 1;\n<mark class="red" id="red"> if(( 1 == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check argument',()=>{
    setStringCode('function foo(x,y){\nif(x==1)\nreturn 1;\nif(y==2)\nreturn 1;\n}');
    setArgs('1 2');
    parseb(parseCode('function foo(x,y){\nif(x==1)\nreturn 1;\nif(y==2)\nreturn 1;\n}').body);
    assert.equal(getsubstring(), 'function foo(x,y){\n<mark class="green" id="green"> if(( x == 1 ))</mark> \nreturn 1;\n<mark class="green" id="green"> if(( y == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check array argument',()=>{
    setStringCode('function foo(x){\nif(x[0]==1)\nreturn 1;\nif(x[1]==2)\nreturn 1;\n}');
    setArgs('[1,2]');
    parseb(parseCode('function foo(x){\nif(x[0]==1)\nreturn 1;\nif(x[1]==2)\nreturn 1;\n}').body);
    assert.equal(getsubstring(), 'function foo(x){\n<mark class="green" id="green"> if(( x[0] == 1 ))</mark> \nreturn 1;\n<mark class="green" id="green"> if(( x[1] == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check global',()=>{
    setStringCode('let x=0;\nfunction foo(y){\nif(y==x)\nreturn 1;\n}');
    setArgs('0');
    parseb(parseCode('let x=0;\nfunction foo(y){\nif(y==x)\nreturn 1;\n}').body);
    assert.equal(getsubstring(),  'let x=0;\nfunction foo(y){\n<mark class="green" id="green"> if(( y == x ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check global',()=>{
    setStringCode('function foo(x, y){\nlet a = x;\nlet b = a;\nb = b+1;\nif (b == y) {\nreturn 1;\n} \n}\n');
    setArgs('1 2');
    parseb(parseCode('function foo(x, y){\nlet a = x;\nlet b = a;\nb = b+1;\nif (b == y) {\nreturn 1;\n} \n}\n').body);
    assert.equal(getsubstring(),'function foo(x, y){\n<mark class="green" id="green"> if(( ( x + 1 ) == y )){ </mark> \nreturn 1;\n}\n}\n');
    clean();
});

it('check same parameter as global',()=>{
    setStringCode('let x=0;\nfunction foo(x){\nif(x==1)\nreturn x;\n}');
    setArgs('1');
    parseb(parseCode('let x=0;\nfunction foo(x){\nif(x==1)\nreturn x;\n}').body);
    assert.equal(getsubstring(),'let x=0;\nfunction foo(x){\n<mark class="green" id="green"> if(( x == 1 ))</mark> \nreturn x;\n}\n');
    clean();
});

it('check same parameter as global',()=>{
    setStringCode('let x=0;\nfunction foo(x){\nif(x==1)\nreturn x;\n}');
    setArgs('1');
    parseb(parseCode('let x=0;\nfunction foo(x){\nif(x==1)\nreturn x;\n}').body);
    assert.equal(getsubstring(),'let x=0;\nfunction foo(x){\n<mark class="green" id="green"> if(( x == 1 ))</mark> \nreturn x;\n}\n');
    clean();
});

it('check array rec',()=>{
    setStringCode('function foo(x){\nif(x[1]==2)\nreturn 1;\n}');
    setArgs('[[1],2]');
    parseb(parseCode('function foo(x){\nif(x[1]==2)\nreturn 1;\n}').body);
    assert.equal(getsubstring(), 'function foo(x){\n<mark class="green" id="green"> if(( x[1] == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check while',()=>{
    setStringCode('function foo(x){\nwhile(true){\nx=x+1;\n}\n}');
    setArgs('1');
    parseb(parseCode('function foo(x){\nwhile(true){\nx=x+1;\n}\n}').body);
    assert.equal(getsubstring(), 'function foo(x){\nwhile(true){\nx = ( x + 1 );\n}\n}\n');
    clean();
});

it('check function after function',()=>{
    setStringCode('function foo(){\n}\nfunction foo(){\n}');
    setArgs('');
    parseb(parseCode('function foo(){\n}\nfunction foo(){\n}').body);
    assert.equal(getsubstring(), 'function foo(){\n}\nfunction foo(){\n}\n');
    clean();
});

it('check outside function- let and if',()=>{
    setStringCode('let x;\nx=0;\nif(x==0){\n}\n');
    setArgs('');
    parseb(parseCode('let x;\nx=0;\nif(x==0){\n}\n').body);
    assert.equal(getsubstring(), 'let x;\nx = 0;\nif(( 0 == 0 )){\n}\n');
    clean();
});

it('check outside function while',()=>{
    setStringCode('let x=0;\nwhile(true){\nx=x+1;\n}\n');
    setArgs('');
    parseb(parseCode('let x=0;\nwhile(true){\nx=x+1;\n}\n').body);
    assert.equal(getsubstring(), 'let x=0;\nwhile(true){\nx = x+1;\n}\n');
    clean();
});

it('check outside function while not blockstatemenr',()=>{
    setStringCode('let x=0;\nwhile(true)\nx=x+1;');
    setArgs('');
    parseb(parseCode('let x=0;\nwhile(true)\nx=x+1;').body);
    assert.equal(getsubstring(), 'let x=0;\nwhile(true)\nx = x+1;\n');
    clean();
});


it('check outside function if not blockstatemenr',()=>{
    setStringCode('let x=0;\nif(x==0)\nx=x+1;');
    setArgs('');
    parseb(parseCode('let x=0;\nif(x==0)\nx=x+1;').body);
    assert.equal(getsubstring(), 'let x=0;\nif(( 0 == 0 ))\nx = x+1;\n');
    clean();
});

it('check outside function else not blockstatemenr',()=>{
    setStringCode('let x=0;\nif(x==0){\nx=x+1;\n}\nelse\nx=x+1;\n');
    setArgs('');
    parseb(parseCode('let x=0;\nif(x==0){\nx=x+1;\n}\nelse\nx=x+1;\n').body);
    assert.equal(getsubstring(), 'let x=0;\nif(( 0 == 0 )){\nx = x+1;\n}\nelse\nx = x+1;\n');
    clean();
});

it('check outside function else',()=>{
    setStringCode('let x=0;\nif(x==0){\nx=x+1;\n}\nelse{\nx=x+1;\n}\n');
    setArgs('');
    parseb(parseCode('let x=0;\nif(x==0){\nx=x+1;\n}\nelse{\nx=x+1;\n}\n').body);
    assert.equal(getsubstring(),'let x=0;\nif(( 0 == 0 )){\nx = x+1;\n}\nelse{\nx = x+1;\n}\n');
    clean();
});

it('check few globals',()=>{
    setStringCode('let y=1;\n' +
        'let x=0;\n' +
        'x=x+y;');
    setArgs('');
    parseb(parseCode('let y=1;\n' +
        'let x=0;\n' +
        'x=x+y;').body);
    assert.equal(getsubstring(),'let y=1;\nlet x=0;\nx = x+y;\n');
    clean();
});


it('check let array',()=>{
    setStringCode('function foo(x){\n' +
        'let x;\n' +
        'x=0;\n' +
        'let y = [1,2];\n' +
        'if(y[0]==1)\n' +
        'x=x+1\n' +
        '}');
    setArgs('');
    parseb(parseCode('function foo(x){\n' +
        'let x;\n' +
        'x=0;\n' +
        'let y = [1,2];\n' +
        'if(y[0]==1)\n' +
        'x=x+1\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(x){\n<mark class="green" id="green"> if(( 1 == 1 ))</mark> \n}\n');
    clean();
});


it('check let array',()=>{
    setStringCode('function foo(x){\n' +
        'let a=0;\n' +
        'let y = x[a];\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        '}');
    setArgs('[1,2]');
    parseb(parseCode('function foo(x){\n' +
        'let a=0;\n' +
        'let y = x[a];\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(x){\n<mark class="green" id="green"> if(( x[0] == 1 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check let array globals',()=>{
    setStringCode('function foo(x,y){\n' +
        'let a=x[y];\n' +
        'if(a==2)\n' +
        'return 1;\n' +
        '}');
    setArgs('[1,2] 1');
    parseb(parseCode('function foo(x,y){\n' +
        'let a=x[y];\n' +
        'if(a==2)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(x,y){\n<mark class="green" id="green"> if(( x[y] == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check let array globals',()=>{
    setStringCode('function foo(x,y){\n' +
        'let a=x[y];\n' +
        'if(a==2)\n' +
        'return 1;\n' +
        '}');
    setArgs('[1,2] 1');
    parseb(parseCode('function foo(x,y){\n' +
        'let a=x[y];\n' +
        'if(a==2)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(x,y){\n<mark class="green" id="green"> if(( x[y] == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});

it('check let array globals',()=>{
    setStringCode('function foo(x,y){\n' +
        'if(true)\n' +
        'return 1;\n' +
        'else if(false)\n' +
        'return 2;\n' +
        '}');
    setArgs('2 3');
    parseb(parseCode('function foo(x,y){\n' +
        'if(true)\n' +
        'return 1;\n' +
        'else if(false)\n' +
        'return 2;\n' +
        '}').body);
    assert.equal(getsubstring(), 'function foo(x,y){\n<mark class="green" id="green"> if(true)</mark> \nreturn 1;\n<mark class="red" id="red"> else if(false)</mark> \nreturn 2;\n}\n');
    clean();
});


it('check let array globals',()=>{
    setStringCode('function foo(x){\n' +
        'let a=[1,2];\n' +
        'let y = a[x];\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        '}');
    setArgs('0');
    parseb(parseCode('function foo(x){\n' +
        'let a=[1,2];\n' +
        'let y = a[x];\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(x){\n<mark class="green" id="green"> if(( a[x] == 1 ))</mark> \nreturn 1;\n}\n');
    clean();
});


it('check else if ',()=>{
    setStringCode('function foo(y){\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        'else if(y==2){\n' +
        'return 1;\n' +
        '}\n' +
        '}');
    setArgs('2');
    parseb(parseCode('function foo(y){\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        'else if(y==2){\n' +
        'return 1;\n' +
        '}\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(y){\n<mark class="red" id="red"> if(( y == 1 ))</mark> \nreturn 1;\n<mark class="green" id="green"> else if(( y == 2 )){ </mark> \nreturn 1;\n}\n}\n');
    clean();
});



it('check while without blockstatement ',()=>{
    setStringCode('function foo(){\n' +
        'while(true)\n' +
        'return 1;\n' +
        '}');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'while(true)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(),'function foo(){\nwhile(true)\nreturn 1;\n}\n');
    clean();
});


it('check while blockstatement ',()=>{
    setStringCode('function foo(x,y){\nif(y==1)\nreturn 1;\nelse{\nreturn 1;\n}\nif(x==1)\nreturn 1;\n' +
        'else\n' +
        'return 1;\n' +
        '}');
    setArgs('1 1');
    parseb(parseCode('function foo(x,y){\n' +
        'if(y==1)\n' +
        'return 1;\n' +
        'else{\n' +
        'return 1;\n' +
        '}\n' +
        'if(x==1)\n' +
        'return 1;\n' +
        'else\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(), 'function foo(x,y){\n<mark class="green" id="green"> if(( y == 1 ))</mark> \nreturn 1;\nelse{\nreturn 1;\n}\n<mark class="green" id="green"> if(( x == 1 ))</mark> \nreturn 1;\nelse\nreturn 1;\n}\n');
    clean();
});


it('check local assingment array',()=>{
    setStringCode('function foo(){\n' +
        'let a;\n' +
        'a = [1,2];\n' +
        'if(a[0]==1)\n' +
        'return 1;\n' +
        '\n' +
        '}');
    setArgs('');
    parseb(parseCode('function foo(){\n' +
        'let a;\n' +
        'a = [1,2];\n' +
        'if(a[0]==1)\n' +
        'return 1;\n' +
        '\n' +
        '}').body);
    assert.equal(getsubstring(), 'function foo(){\n<mark class="green" id="green"> if(( 1 == 1 ))</mark> \nreturn 1;\n}\n');
    clean();
});


it('check local assingment array',()=>{
    setStringCode('function foo(x){\n' +
        'x = [1,2];\n' +
        'if(x[0]==1)\n' +
        'return 1;\n' +
        '}');
    setArgs('0');
    parseb(parseCode('function foo(x){\n' +
        'x = [1,2];\n' +
        'if(x[0]==1)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(), 'function foo(x){\nx = [1,2];\n<mark class="green" id="green"> if(( x[0] == 1 ))</mark> \nreturn 1;\n}\n');
    clean();
});


it('check global assingment ',()=>{
    setStringCode('function foo(x,y,z){\n' +
        'z = 1+1;\n' +
        'if(z==2)\n' +
        'return 1;\n' +
        '}');
    setArgs('1 2 3');
    parseb(parseCode('function foo(x,y,z){\n' +
        'z = 1+1;\n' +
        'if(z==2)\n' +
        'return 1;\n' +
        '}').body);
    assert.equal(getsubstring(), 'function foo(x,y,z){\nz = ( 1 + 1 );\n<mark class="green" id="green"> if(( z == 2 ))</mark> \nreturn 1;\n}\n');
    clean();
});


it('check global array ',()=>{
    setStringCode('let x = [1,2];\n' +
        'let y = x[0];\n' +
        'if(y==1){}\n');
    setArgs('1 2 3');
    parseb(parseCode('let x = [1,2];\n' +
        'let y = x[0];\n' +
        'if(y==1){}\n').body);
    assert.equal(getsubstring(), 'let x=[1,2];\nlet y=0;\nif(( 0 == 1 )){\n}\n');
    clean();
});