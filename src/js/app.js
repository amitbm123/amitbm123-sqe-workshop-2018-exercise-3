import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {parseb} from './code-analyzer';
import {setStringCode,setArgs,getConections,getDefineNodes} from './code-analyzer';
const flowchart = require('flowchart.js');

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringCode = $('#codePlaceholder').val();
        let args = $('#enterArguments').val();
        setStringCode(stringCode);
        setArgs(args);
        let parsedCode = parseCode(stringCode);
        parseb(parsedCode.body);
        var diagram = flowchart.parse(getDefineNodes().concat('\n').concat(getConections()));
        diagram.drawSVG('diagram');
        diagram.drawSVG('diagram', {'x': 0,'y': 0,'line-width': 3,'line-length': 50,'text-margin': 10,
            'font-size': 14,'font-color': 'black','line-color': 'black','element-color': 'black',
            'fill': 'white','yes-text': 'yes','no-text': 'no','arrow-end': 'block', 'scale': 1,
            'symbols': {'start': {
                'font-color': 'white',
                'element-color': 'black',
                'fill': 'yellow'}},
            'flowstate' : {
                'true' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'true', 'no-text' : 'false' }}});});
});





