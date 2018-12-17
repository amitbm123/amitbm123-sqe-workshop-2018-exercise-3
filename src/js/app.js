import $ from 'jquery';
import {parseCode} from './code-analyzer';
//import {arrayTable} from './code-analyzer';
import {parseb} from './code-analyzer';
//import {cleanTable} from './code-analyzer';
import {getStringTable,setStringCode,setArgs, getvars,getsubstring, getglobals} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringCode = $('#codePlaceholder').val();
        let args = $('#enterArguments').val();
        setStringCode(stringCode);
        setArgs(args);
        let parsedCode = parseCode(stringCode);
        parseb(parsedCode.body);
        $('#parsedCodeOut').html(getsubstring());
        //let table=getStringTable();
        // $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        // $('#parseTable').append(table);
        //  cleanTable(arrayTable);
    });
});
