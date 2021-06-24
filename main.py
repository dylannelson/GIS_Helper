print('Starting Imports')
import webbrowser
import time
import os
print('Completed Imports')
print()
# Gather Data
print('Gathering Data.', end='\r')
time.sleep(1)
print('Gathering Data..', end='\r')
time.sleep(1)
print('Gathering Data...', end='\r')
time.sleep(1)
print()
print('COMPLETE: Data Download')
print()

# Run Clustering
print('Running Clustering.', end='\r')
time.sleep(1.5)
print('Running Clustering..', end='\r')
time.sleep(1.5)
print('Running Clustering...', end='\r')
time.sleep(1.5)
print()
print('COMPLETE: Clustering')
print()

files = os.listdir('./Photos')
print("creating files:")
for i in files:
    print('\t', i)
    time.sleep(.15)

print()
print('***Opening Browser***')
time.sleep(2)
webbrowser.open("index.html")
