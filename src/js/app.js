import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {arrayTable} from './code-analyzer';
import {parseb} from './code-analyzer';
import {cleanTable} from './code-analyzer';
import {getStringTable,setStringCode} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringCode = $('#codePlaceholder').val();
        setStringCode(stringCode);
        let parsedCode = parseCode(stringCode);
        parseb(parsedCode.body);
        let table=getStringTable();
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        $('#parseTable').append(table);
        cleanTable(arrayTable);
    });
});
