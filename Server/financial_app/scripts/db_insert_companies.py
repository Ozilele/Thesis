import pandas as pd
import csv
import yfinance as yf
import threading
import time
from stocks import models

ticker_list = ["AAPL", "GOGL", "MSFT", "INTC", "TSLA", "NVDA", "AMD", "AMZN"]
other_ticker_list = ["GOOG", "META", "ORCL", "WMT", "JPM", "NFLX", "KO", "PEP", "MCD", "IBM", "GS", "DIS", "TSM", "ASML", "CSCO", "ADBE", "QCOM", "ARM", "DELL", "UBER", "PFE", "BLK", "AMAT", "NKE", "BX", "MA", "V"]

def insert_array_data(tickers): # insert companies data and their info
  start = time.time()
  for ticker in tickers:
    stock_ticker = yf.Ticker(ticker)
    info = stock_ticker.info
    market = info.get('exchange')
    if market is None:
      print(f"Not specified market for ticker: {ticker}")
      continue
    if(info.get('exchange') == 'NMS'):
      market = "NASDAQ"

    company_info = models.CompanyInfo(
      website = info.get('website'),
      country_from = info.get('country'),
      city_from = info.get('city'),
      fiftyDayAveragePrice = info.get('fiftyDayAverage'),
      fiftyTwoWeekHighPrice = info.get('fiftyTwoWeekHigh'),
      fiftyTwoWeekLowPrice = info.get('fiftyTwoWeekLow'),
      dividendRate = info.get('dividendRate')
    )
    company_info.save()
    company = models.Company(
      name = info.get("shortName"),
      description = info.get('longBusinessSummary'),
      sector = info.get('sector'),
      ticker_symbol = ticker,
      market = market,
      info = company_info
    )
    company.save()
    print(f"Done it took: {time.time() - start} seconds")

lock = threading.Lock()

def insert_sp_500_data(file_path, start_row, row_count): # script for saving s&p500 companies data
  try:
    df = pd.read_csv(file_path, skiprows=start_row, nrows=row_count, header=None, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL) # read csv by chunks
    for index, row in df.iterrows():
      stock_ticker = row[3]
      ticker = yf.Ticker(ticker=stock_ticker)
      info = ticker.info
      with lock:
        company_info = models.CompanyInfo(
          website = info.get('website'),
          country_from = info.get('country'),
          city_from = row[5],
          fiftyDayAveragePrice = info.get('fiftyDayAverage'),
          fiftyTwoWeekHighPrice = info.get('fiftyTwoWeekHigh'),
          fiftyTwoWeekLowPrice = info.get('fiftyTwoWeekLow'),
          dividendRate = info.get('dividendRate')
        )
        company_info.save()
        company = models.Company(
          name = row[0],
          description = row[1],
          sector = row[2],
          ticker_symbol = stock_ticker,
          market = row[4],
          info = company_info
        )
        company.save()
  except Exception as e:
    print(f"Error processing rows {start_row} to {start_row + row_count - 1}: {e}")

def run():
  start = time.time()
  # name,description,sector,ticker,market,headquarters
  # file_path = "s&p500_data_db.csv"
  # threads = []
  # per_thread = 50
  # csv_length = 473
  # for i in range(0, csv_length, per_thread):
  #   print(f"Thread {i}")
  #   t = threading.Thread(target=insert_sp_500_data, args=(file_path, i, per_thread))
  #   threads.append(t)
  # for thread in threads:
  #   thread.start()
  # for t in threads:
  #   t.join()
  sp_100_tickers = ["BF-B"]
  insert_array_data(sp_100_tickers)
  print(f"Done it took: {time.time() - start} seconds")
