/*
        *File: DockerSandbox.js
        *Author: Osman Ali Mian/Asad Memon
        *Created: 3rd June 2014
        *Revised on: 25th June 2014 (Added folder mount permission and changed executing user to nobody using -u argument)
        *Revised on: 30th June 2014 (Changed the way errors are logged on console, added language name into error messages)
*/


/**
         * @Constructor
         * @variable DockerSandbox
         * @description This constructor stores all the arguments needed to prepare and execute a Docker Sandbox
         * @param {Number} timeout_value: The Time_out limit for code execution in Docker
         * @param {String} path: The current working directory where the current API folder is kept
         * @param {String} folder: The name of the folder that would be mounted/shared with Docker container, this will be concatenated with path
         * @param {String} vm_name: The TAG of the Docker VM that we wish to execute
         * @param {String} compiler: The compiler/interpretor to use for carrying out the translation
         * @param {String} compileTarget: The compileTarget to which source code will be written
         * @param {String} code: The actual code
         * @param {String} runTarget: Used in case of compilers only, to execute the object code, send " " in case of interpretors
*/

var getLangByID = require('./compilers').getLangByID;
var async = require('async');

var DockerSandbox = function(timeout_value, path, folder, vm_name, langID, code, tests, stdin_data)
{

    this.timeout_value=timeout_value;
    this.path=path;
    this.folder=folder;
    this.vm_name=vm_name;
    this.code = code;
    this.tests = tests;
    this.stdin_data=stdin_data;

    const compilerInfo = getLangByID(langID);

    this.fileExt = compilerInfo.fileExt;
    this.compiler = compilerInfo.compiler;
    this.compileTarget = compilerInfo.compileTarget;
    this.langName = compilerInfo.language;
    this.runtimeArgs = compilerInfo.runtimeArgs;
    this.interpretWithFileExt = compilerInfo.interpretWithFileExt;
    this.interpreter = compilerInfo.interpreter;

    this.testNames = tests.map(function(test){ return test.name }).toString().replace(/,/g, ' ');

    if (this.interpretWithFileExt){
        this.runTarget = this.testNames;
    }else{
        this.runTarget = tests.map(function(test){ return test.name.split('.')[0] }).toString().replace(/,/g, ' ');
    }
}

/**
         * @function
         * @name DockerSandbox.run
         * @description Function that first prepares the Docker environment and then executes the Docker sandbox 
         * @param {Function pointer} success ?????
*/

DockerSandbox.prototype.run = function(success) 
{
    var sandbox = this;

    this.prepare(function(){
        sandbox.execute(success);
    });
}


/*
         * @function
         * @name DockerSandbox.prepare
         * @description Function that creates a directory with the folder name already provided through constructor
         * and then copies contents of folder named Payload to the created folder, this newly created folder will be mounted
         * on the Docker Container. A file with the name specified in compileTarget variable of this class is created and all the
         * code written in 'code' variable of this class is copied into this file.
         * Summary: This function produces a folder that contains the source file and 2 scripts, this folder is mounted to our
         * Docker container when we run it.
         * @param {Function pointer} success ?????
*/
DockerSandbox.prototype.prepare = function(success)
{
    var exec = require('child_process').exec;
    var fs = require('fs');
    var async = require('async');
    var sandbox = this;

    console.log('Make Directory \n' + "mkdir "+ this.path+this.folder + " && cp "+this.path+"/Payload/* "+this.path+this.folder+"&& chmod 777 "+ this.path+this.folder)

    exec("mkdir "+ this.path+this.folder + " && cp "+this.path+"/Payload/* "+this.path+this.folder+"&& chmod 777 "+ this.path+this.folder, function(st){
        //combine the tests and normal code into one object so we can iterate through them to make all the files
        var combinedCode = sandbox.code.concat(sandbox.tests);

        //Make a file for each class/piece of code
        async.each(combinedCode, function(file, callback){
            //get the file extension to make the file
            
            fs.writeFile(sandbox.path + sandbox.folder+ "/" + file.name, file.code, function(err){
                callback(err);
            });
        }, function(err){
            if (err) 
            {
                console.log(err);
            }    
            else
            {
                exec("chmod 777 \'" + sandbox.path + sandbox.folder+ "/" + sandbox.compileTarget+ "\'")

                fs.writeFile(sandbox.path + sandbox.folder+"/inputFile", sandbox.stdin_data, function(err) 
                {
                    if (err) 
                    {
                        console.log(err);
                    }    
                    else
                    {
                        console.log("Input file was saved!");
                        success();
                    } 
                });
            } 
        });
    });
}

/*
         * @function
         * @name DockerSandbox.execute
         * @precondition: DockerSandbox.prepare() has successfully completed
         * @description: This function takes the newly created folder prepared by DockerSandbox.prepare() and spawns a Docker container
         * with the folder mounted inside the container with the name '/usercode/' and calls the script.sh file present in that folder
         * to carry out the compilation. The Sandbox is spawned ASYNCHRONOUSLY and is supervised for a timeout limit specified in timeout_limit
         * variable in this class. This function keeps checking for the file "Completed" until the file is created by script.sh or the timeout occurs
         * In case of timeout an error message is returned back, otherwise the contents of the file (which could be the program output or log of 
         * compilation error) is returned. In the end the function deletes the temporary folder and exits
         * 
         * Summary: Run the Docker container and execute script.sh inside it. Return the output generated and delete the mounted folder
         *
         * @param {Function pointer} success ?????
*/

DockerSandbox.prototype.execute = function(success){
    var exec = require('child_process').exec;
    var fs = require('fs');
    var myC = 0; //variable to enforce the timeout_value
    const checkTime = 250; //milliseconds before you check
    var sandbox = this;

    var baseSt = this.path +'DockerTimeout.sh ' + this.timeout_value + 's -i -t -v  "' + this.path + this.folder + '":/usercode -w /usercode ' + this.vm_name + ' python runner.py';

    if (this.compiler){
        baseSt += ' -c ' + this.compiler;
        baseSt += ' -t ' + this.compileTarget;
    }

    baseSt += ' -i ' + this.interpreter;

    baseSt += ' ' + this.runTarget;

    //log the statement in console
    console.log('Docker Run \n' + baseSt);

    //execute the Docker, This is done ASYNCHRONOUSLY
    exec(baseSt, function(err, stdout){
    	console.log("STDOUT");
    	console.log(stdout);
	});

    console.log("------------------------------")
    //Check For File named "completed" after every 1 second

    var intid = setInterval(function() {
        myC = myC + (checkTime / 1000);
		
        fs.readFile(sandbox.path + sandbox.folder + '/results/completed', 'utf8', function(err, completed) {
            
            //if file is not available yet and the file interval is not yet up carry on
            if (err && myC < sandbox.timeout_value) 
            {
                return;
            } 
            //if file is found simply display a message and proceed
            else if (myC < sandbox.timeout_value){
                console.log("DONE")
                //get the results

                function reader(path){
                    return function(cb){                  		
                        fs.readFile(sandbox.path + sandbox.folder + path, 'utf8', function(err, results){
                            if (err) results = '';                	
    	
                            cb(null, results);
                        }); 
                    }
                }

                async.parallel({
                    errors: reader('/results/errors.txt'),
                    passedTests: reader('/results/passed.txt'),
                    failedTests: reader('/results/failed.txt')
                }, function(errs, results){
                    //add the file ext to the end of tests if necessary
                    if (!sandbox.interpretWithFileExt){
                        
                        function addExt(tests){
                            if (tests === ''){ return '' };
                            return tests.split(' ').map(function(testName){ return testName + sandbox.fileExt }).toString().replace(/,/g, ' ');
                        }

                        results.passedTests = addExt(results.passedTests)
                        results.failedTests = addExt(results.failedTests)
                    }

                    //if it's python, and the end is "OK", it's not an actual error, no clue why they write to stderr
                    if ((sandbox.langName === 'Python2' || sandbox.langName === 'Python3')
                        && results.errors.substring(results.errors.length - 3, results.errors.length - 1) === 'OK'){
                        results.errors = '';
                    }
                    
                    //convert from space delimited string to arrays
                    results.passedTests = results.passedTests.trim().split(' ');
                    results.failedTests = results.failedTests.trim().split(' ');
                    success(results.errors, results.passedTests, results.failedTests);
                })

            }else{
                //if time is up. Save an error message to the data variable
                console.log('Execution timed out')
                success('Execution timed out.', null, null)
            }

            //now remove the temporary directory
            console.log("ATTEMPTING TO REMOVE: " + sandbox.folder);
            console.log("------------------------------")
            exec("rm -rf " + sandbox.folder);
            
            clearInterval(intid);
        });

    }, checkTime);
}


module.exports = DockerSandbox;
