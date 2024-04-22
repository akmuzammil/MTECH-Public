"""
File: ParallelizeScript.py
Author: Abdul Kareem Muzammil
BITS ID: 2023mt03579
Date: 01-March-2024
Description: 
This is a Python script that simulates the partitioning of data and its parallel processing. 
The script divides a large array of numbers into smaller chunks, distribute these chunks across 
multiple processes for summing the numbers, and then aggregate the results.
"""


"""
import required libraries
"""
import multiprocessing
import os
import datetime
import numpy as np
import time

"""
sum_chunk function to calculate sum of a chunk containing list of numbers
inputs:
1. chunk: list of numbers

returns:
sum of the chunk
"""
def sum_chunk(chunk):
    # get processor identity
    rank = multiprocessing.current_process()._identity[0]
    """
    Adding CPU intensive operation like factorial of large number to be able to demonstrate that all cores of CPU
    are utilized.

    If we remove below line, since the sum operation is very fast, all cores of CPU are not utilized.
    """
    factorial = np.math.factorial(500000)
    start_time=time.time()
    """Sum the numbers in a given chunk."""
    chunk_sum=sum(chunk)
    end_time=time.time()
    elapsed_time=end_time-start_time
    # print(f"Sum of chunk from processor {rank} is: {chunk_sum}, Time: {datetime.datetime.now().time()} ",flush=True)
    print(f"{rank} \t\t\t{chunk_sum}\t\t {elapsed_time}",flush=True)
    return chunk_sum



"""
parallel_sum function to calculate sum of numbers parallely
inputs:
1. data: list of numbers (usually very large)
2. num_processes: number of parallel processes to be created and executed in

returns:
sum of numbers in the data list.
"""
def parallel_sum(data, num_processes):
    
    """Divide the data into chunks"""
    chunk_size = len(data) // num_processes
    chunks = [data[i:i+chunk_size] for i in range(0, len(data), chunk_size)]
    """Process them in parallel"""
    with multiprocessing.Pool(processes=num_processes) as pool:
        results = pool.map(sum_chunk, chunks)

    """Aggregate the results."""
    agg_start_time=time.time()
    total_sum = sum(results)
    agg_end_time=time.time()
    print(f"Aggregation time elapsed:{agg_end_time-agg_start_time}")
    return total_sum

"""
function to print '-' for table header and footer for output display
"""
def print_star():
    for i in range(0,70):
        print('-',end="")
    print()


"""
Main function which is the entry point of the program.
"""
if __name__ == "__main__":
    
    # Initialize data: a large array of numbers
    data = list(range(1, 1000001))
    # Get number of system CPU cores
    nprocs = multiprocessing.cpu_count()
    print(f"Number of CPU cores detected: {nprocs}")
    # Number of processes to simulate parallelism
    # note:it is just a desire to have one process per CPU core, therefore setting num_processes 
    # to be the number of available CPU cores
    num_processes = nprocs

    print("Assigning number of processes same as number of cores")
    print(f"Start time: {datetime.datetime.now().time()}")
    
    print_star()
    print(f"Processor\t\tChunk Sum\t\tElapsed Time")
    print_star()
    # Simulate parallel processing
    result = parallel_sum(data, num_processes)
    # print Total sum
    print_star()
    print(f"\033[1m Total sum: {result} \033[0m \t")
    print_star()
        
    print(f"End time: {datetime.datetime.now().time()}")

    print("""NOTE: about 7 seconds of delay is added because of compute intensive operation included in the code.
    This compute intensive operation is included so that all processors could be utilized.""")
   
