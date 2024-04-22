from hdfs import InsecureClient
import csv

# Mapper Function
def mapper(hdfs_host, hdfs_path):
    # initialize hdfs client
    client = InsecureClient(hdfs_host)
    # open file via client
    with client.read(hdfs_path, encoding='utf-8') as file:
        # file reader
        reader = csv.reader(file)
        # data to hold mapper output
        data = {}
        # loop through each row using reader to yield key, values
        for row in reader:
            category = row[2]
            price = float(row[3])
            stock = int(row[4])
            if category not in data:
                data[category] = []
            data[category].append((price, stock))
        return data.items()

# Reducer Function
def reducer(data):
    result = {}
    # loop through key, values supplied by mapper
    for category, values in data:
        total_price = 0
        total_stock = 0
        total_products = 0
        # count values
        for value in values:
            price, stock = value 
            total_price += price
            total_stock += stock
            total_products += 1
        # find average
        average_price = total_price / total_products
        result[category] = (average_price, total_products, total_stock)
    # return result
    return result

# Main Function
if __name__ == "__main__":
    # HDFS host and path
    hdfs_host = 'http://localhost:9870'
    hdfs_path = '/bds-lab1/products.csv'

    # pass input from products.csv in HDFS
    data = mapper(hdfs_host, hdfs_path)

    # pass mapper output to reducer
    reduced_data = reducer(data)


    # Printing the results
    format_string = "{:<20}{:<10}{:<15}{:<15}"
    print(format_string.format(*['Category','Avg Price','Total Products','Total Stock']))
    print(format_string.format(*['--------','---------','--------------','-----------']))
    for category, (avg_price, total_products, total_stock) in reduced_data.items():
        print(format_string.format(*[f'{category}',f'{avg_price:.2f}',f'{total_products}',f'{total_stock}']))
    
