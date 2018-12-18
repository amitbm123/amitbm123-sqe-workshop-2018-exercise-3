import $ from 'jquery';
import {parseCode} from './code-analyzer';
//import {arrayTable} from './code-analyzer';
import {parseb} from './code-analyzer';
//import {cleanTable} from './code-analyzer';
import {setStringCode,setArgs,getsubstring} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringCode = $('#codePlaceholder').val();
        let args = $('#enterArguments').val();
        setStringCode(stringCode);
        setArgs(args);
        let parsedCode = parseCode(stringCode);
        parseb(parsedCode.body);
        $('#parsedCodeOut').html(getsubstring());
    });
});
