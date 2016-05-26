var express = require('express');
var arr = require('./compilers');
var sandBox = require('./DockerSandbox');
var app = express();
var bodyParser = require('body-parser')
var port = 3000;

app.use(bodyParser.json());

function random(size) {
    //returns a crypto-safe random
    return require("crypto").randomBytes(size).toString('hex');
}

app.post('/compile', function(req, res) {
	console.log("COMPILE------------------------------------");
    const folder = 'temp/' + random(10); //folder in which the temporary folder will be saved
    const path = __dirname+"/"; //current working path
    const vm_name = 'grading_machine'; //name of virtual machine that we want to execute
    const timeout_value = 8;//Timeout Value, In Seconds
 
    var language = req.body.language;
    var code = req.body.code;
    var tests = req.body.tests;
    var stdin = req.body.stdin;

    //details of this are present in DockerSandbox.js
    var sandboxType = new sandBox(
        timeout_value,
        path,
        folder,
        vm_name,
        language,
        code,
        tests,
        stdin
    );

    //data will contain the output of the compiled/interpreted code
    //the result maybe normal program output, list of error messages or a Timeout error
    sandboxType.run(function(data, exec_time, err)
    {
        //console.log("Data: received: "+ data)
    	return res.send({ output: data, langid: language, code: code, errors: err, time: exec_time });
    });
});

var http = require('http');

app.set('port', port);

var server = http.createServer(app);

server.listen(port);

console.log('Server running on port 3000');
