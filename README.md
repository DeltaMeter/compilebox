# Purpose
This is a sandbox for testing user defined code. Code and tests are passed in through the API, and a Docker instance is launched. Passed tests, failed tests, and stderr are all returned. This could be used for autograding student's code, holding programming competitions, etc. 

Forked from [compilebox](https://github.com/remoteinterview/compilebox)

# Objectives of fork:

* can compile and interpret multiple source files!
* built in support for testing code
* can now link third party libraries (like unit testing libraries)
* tidied up the code in various ways

## (Currently) Supported languages
* Java 8 
* Python 2
* Python 3 

However, supporting more languages is trivial!

### API Calls:
```javascript
{
    language: Integer // the languageID of the language the code is in. LangIds can be found in api/compilers.js
    code: 
        [

            {
                name: String, // name of file i.e. hello.py
                code: String // the actual code being compiled and/or intepreted
            },
            ...
        ]
    tests:
        [

            {
                name: String, // name of test i.e. helloTest.py
                code: String // the test code
            },
            ...
        ]
    
}
```
### API Response:
```javascript
{
    passedTests: Array[String] //contains the names of passed tests
    failedTests: Array[String] //contains the names of failed tests
    errors: String //runtime/compilation errors encountered
}
```

