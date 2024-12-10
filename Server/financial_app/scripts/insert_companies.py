import pandas as pd
import csv
import yfinance as yf
import threading
import time
from stocks import models
from requests_ratelimiter import LimiterSession, RequestRate, Limiter, Duration
from pyrate_limiter import SQLiteBucket
from pprint import pprint

# csvFileFrame = pd.read_csv("stock-list-processed.csv", sep=',')
# nyse_nasdaqFrame = csvFileFrame[(csvFileFrame['exchangeShortName'].isin(['NYSE', 'NASDAQ'])) & (csvFileFrame['type'] == 'stock ')]
# europeanFrame = csvFileFrame[(csvFileFrame['exchangeShortName'].isin(['NYSE', 'NASDAQ'])) & (csvFileFrame['type'] == 'stock ')]
sqlite_bucket = SQLiteBucket(identity="limits", path="ratelimit.sqlite")
history_rate = RequestRate(4, Duration.SECOND) # max 4 requests per second
limiter = Limiter(history_rate)
session = LimiterSession(limiter=limiter, bucket_class=sqlite_bucket)
session.headers['User-agent'] = 'tickerpicker/2.0'
lock = threading.Lock()

processed_tickers = ["AAPL", "GOGL", "MSFT", "INTC", "TSLA", "NVDA", "AMD", "AMZN", "GOOG", "META", "ORCL", "WMT", "JPM", "NFLX", "KO", "PEP", "MCD", "IBM", "GS", "DIS", "TSM", "ASML", "CSCO", "ADBE", "QCOM", "ARM", "DELL", "UBER", "PFE", "BLK", "AMAT", "NKE", "BX", "MA", "V"]

def safe_request(ticker, session, retries=16):
  delay = 1
  for attempt in range(retries):
    try:
      return ticker.info
    except Exception as e:
      if "429" in str(e):
        print(f"Delay: {delay}")
        time.sleep(delay)
        delay *= 2
        continue
      elif "404" in str(e): # 404 Error
        print(f"404 Error: {e}")
        break
  print(f"Failed to fetch data for after {retries} attempts.")
  return None

def save_company_csv(df_range, file_name):
  for index, row in df_range.iterrows():
    ticker_symbol = row['Symbol']
    if ticker_symbol in processed_tickers:
      continue
    sector = f"{row['GICS Sector']}"
    headquarters = row['Headquarters Location']
    name = row['Security']

    ticker = yf.Ticker(ticker=ticker_symbol, session=session)
    info = safe_request(ticker, session)
    if info is None:
      continue

    desc, market = None, None
    if 'exchange' in info:
      if(info.get('exchange') == 'NMS'):
        market = "NASDAQ"
      else:
        market = info.get('exchange')
    if 'longBusinessSummary' in info:
      desc = info['longBusinessSummary']

    with lock:
      with open(file_name, mode="a") as stock_data_file:
        stock_writer = csv.writer(stock_data_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        stock_writer.writerow([name, desc, sector, ticker_symbol, market, headquarters])
    time.sleep(0.3)

def get_sp500_data():
  all_data = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")
  sp_500_tickers = all_data[0]
  sp_500_tickers.to_csv("s&p500_data.csv", index=False)

# def run():
#   start = time.time()
#   all_data = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")
#   sp_500_tickers = all_data[0]
#   data_per_thread = 50
#   threads = []
#   with open("s&p500_data_db.csv", "w") as file:
#     dw = csv.DictWriter(file, delimiter=',', fieldnames=["name", "description", "sector", "ticker", "market", "headquarters"])
#     dw.writeheader()
#   for i in range(0, len(sp_500_tickers), data_per_thread):
#     print(f"Thread number {i % data_per_thread}")
#     range_df = sp_500_tickers[i:min(i + data_per_thread, len(sp_500_tickers))]
#     t = threading.Thread(target=save_company_csv, args=(range_df, "s&p500_data_db.csv"))
#     threads.append(t)

#   for thread in threads:
#     thread.start()
#     time.sleep(1.5)
#   for thread in threads:
#     thread.join()
#   print(f"Done it took: {time.time() - start} seconds")

def download_prices_to_csv():
  start = time.time()
  file_path = "s&p500_data_db.csv"
  df = pd.read_csv(file_path, header=None, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
  # sp_100_tickers = list(df.iloc[400:len(df)+1, 3])
  sp_100_tickers = ["KVUE"]

  data = yf.download(
    tickers=list(sp_100_tickers),
    period='max',
    interval='1d',
    group_by='ticker',
    auto_adjust=False,
    prepost=False, 
    threads=True,
    proxy=None
  )
  data = data.T
  for ticker in sp_100_tickers:
    data.loc[(ticker,),].T.to_csv("5yearly_data/" + ticker + ".csv", sep=',', encoding="utf-8")
  print(f"Done it took: {time.time() - start} seconds")

def run(): # prices to csv
  download_prices_to_csv()
# pprint(msft.income_stmt)
# ciekawsze pola msft.info['currentPrice'], msft.info['currency'], msft.info['dividendRate'], fullTimeEmployees, 'dividendYield - stopa dywidendy procentowa', dividendRate' - yearly dividend amount per 1 share of stock, 'longName',