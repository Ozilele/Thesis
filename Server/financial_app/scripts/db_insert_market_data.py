import threading
import pandas as pd
import time
from datetime import datetime
from stocks.models import MarketData, Company

# ticker_list = ["AAPL", "GOGL", "MSFT", "INTC", "TSLA", "NVDA", "AMD", "AMZN"]
other_ticker_list = ["GOOG", "META", "ORCL", "WMT", "JPM", "NFLX", "KO", "PEP", "MCD", "IBM", "GS", "DIS", "TSM", "ASML", "CSCO", "ADBE", "QCOM", "ARM", "DELL", "UBER", "PFE", "BLK", "AMAT", "NKE", "BX", "MA", "V"]
lock = threading.Lock()

def insert_stock_prices(ticker):
  df = pd.read_csv(f"./5yearly_data/{ticker}.csv", usecols=["Date", "Close", "Volume"], delimiter=',')
  df = df.dropna(subset=["Date", "Close", "Volume"])
  
  for index, row in df.iterrows():
    close_price = round(float(row["Close"]), 3)
    volume = int(float(row["Volume"]))
    date_str = str(row["Date"].split(" ")[0])
    date_obj = datetime.strptime(date_str, "%Y-%m-%d") # 2024-11-22 00:00:00 - indicates stock price danego dnia
    stock = Company.objects.get(ticker_symbol=ticker)
    market = MarketData(
      stock=stock,
      price=close_price,
      volume=volume,
      timestamp=date_obj
    )
    with lock:
      market.save()

def run():
  start = time.time()
  file_path = "s&p500_data_db.csv"
  # df = pd.read_csv(file_path, header=None, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
  # sp_100_tickers = list(df.iloc[400:len(df)+1, 3])
  # sp_100_tickers = list(df.iloc[450:472, 3]) # 151 - 153
  sp_100_tickers = ["KVUE"]

  threads = []
  for ticker in sp_100_tickers: # dla kazdego ticker czytaj jego prices z csv i w petli wrzuc
    t = threading.Thread(target=insert_stock_prices, args=(ticker,))
    threads.append(t)
  for t in threads:
    t.start()
  for t in threads:
    t.join()
  print(f"Done it took: {time.time() - start} seconds for 100 tickers of 5 yearly data")