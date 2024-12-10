import pandas as pd
import threading
import csv
import time
from stocks.models import MarketData, Company
from datetime import datetime

ticker_list = ["AAPL", "GOGL", "MSFT", "INTC", "TSLA", "NVDA", "AMD", "AMZN"]
lock = threading.Lock()

def delete_stock_prices(ticker):
  company = Company.objects.get(ticker_symbol=ticker)
  MarketData.objects.filter(stock=company.id).delete()
  index_to_keep = None
  # target_date = datetime(2024, 11, 22)
  # if market_data.count() > 0:
  #   for index, data in enumerate(market_data):
  #     data.delete()
  # if data.timestamp.date() == target_date.date():
  #   index_to_keep = index
  #   break
  # if index_to_keep is not None:
  #   data_to_be_deleted = market_data[index_to_keep+1:]
  #   for elem in data_to_be_deleted:
  #     elem.delete()

def run():
  start = time.time()
  threads = []
  file_path = "s&p500_data_db.csv"
  df = pd.read_csv(file_path, header=None, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
  # sp_100_tickers = list(df.iloc[400:len(df)+1, 3])
  sp_100_tickers = list(df.iloc[150:200, 3])

  for ticker in sp_100_tickers:
    t = threading.Thread(target=delete_stock_prices, args=(ticker,))
    threads.append(t)
  for thread in threads:
    thread.start()
  for thread in threads:
    thread.join()
  print(f"Done it took: {time.time() - start} seconds")