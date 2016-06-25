import sys
import subprocess
import os
from multiprocessing import Pool
from optparse import OptionParser


if not os.path.exists('results'):
        os.makedirs('results')

errors = open('results/errors.txt', 'w')

interpreter = ''

def shellExec(filename):
	print filename
        testResult = subprocess.call([interpreter + " " + filename], stdout=subprocess.PIPE, stderr=errors, shell=True)
        if testResult == 0:
                return filename
        return ""

def runPrograms(files, options):
        #interpreted languages are already 'compiled', 
        compileResult = 0
        if options.compiler:
		compileResult = subprocess.call(options.compiler + ' ' +  options.compileTargets, stdout=subprocess.PIPE, stderr=errors, shell=True)
		print "Compile Result: %s" % compileResult

        #compilation was successful or unnecessary, so now we run the code
        if compileResults == 0:
                testPool = Pool(processes=8)
             
                tests = testPool.map_async(shellExec, files)

                passedTests = filter((lambda x: x != ""), tests.get(timeout=1))
                failedTests = filter((lambda x: x not in passedTests), files)

                print "Passed " + ' '.join(passedTests)
                print "Failed " + ' '.join(failedTests)

                passedResults = open('results/passed.txt', 'w')
                passedResults.write(' '.join(passedTests))
                passedResults.close()

                failedResults = open('results/failed.txt', 'w')
                failedResults.write(' '.join(failedTests))
                failedResults.close()

        errors.close()
        open('results/completed', 'w').close()

if __name__ == "__main__":
        optParser = OptionParser()
        optParser.add_option('-c', '--compiler', dest='compiler', help='compiler, i.e. javac')
        optParser.add_option('-t', '--compileTargets', dest='compileTargets', help='compile targets, i.e., *.java')
        optParser.add_option('-i', '--interpreter', dest='interpreter', help='interpreter, i.e. java')

        (options, args) = optParser.parse_args()
	print options
	print args        
        interpreter = options.interpreter
        
        runPrograms(args, options)
