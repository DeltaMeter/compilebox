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
        testResult = subprocess.call([interpreter, filename], stdout=subprocess.PIPE, stderr=errors)
        if testResult == 0:
                return filename
        return ""

def runPrograms(files, options):
        if options.compiler:
		print options.compiler
		print options.compileTargets
		print os.listdir('/usr/share/java')
		
		print os.listdir(os.path.dirname(os.path.realpath(__file__)))                
		print os.getcwd()
		print os.path.dirname(os.path.realpath(__file__))	
		test = subprocess.check_output(['ls'])
		print test
		compileResult = subprocess.call([options.compiler, options.compileTargets], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
		print compileResult
		if compileResult != 0:
                	errors.close()
                        sys.exit(1)

        testPool = Pool(processes=8)
     
        tests = testPool.map_async(shellExec, files)

        errors.close()

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
