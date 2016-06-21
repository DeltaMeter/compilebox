import sys
import subprocess
import os
from multiprocessing import Pool

if not os.path.exists('results'):
        os.makedirs('results')

errors = open('results/errors.txt', 'w')

compiler = ''

def shellExec(filename):
        testResult = subprocess.call([compiler, filename], stdout=subprocess.PIPE, stderr=errors)
        if testResult == 0:
                return filename
        return ""

def runPrograms(files):
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
        compiler = sys.argv[1]
        runPrograms(sys.argv[2:])
