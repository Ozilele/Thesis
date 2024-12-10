import time
import yfinance as yf
import requests
import threading
from pprint import pprint
import pandas as pd
from datetime import datetime
from stocks.models import Report, Company

ticker_list = ["AAPL", "GOGL", "MSFT", "INTC", "TSLA", "NVDA", "AMD", "AMZN"]
other_ticker_list = ["GOOG", "META", "ORCL", "WMT", "JPM", "NFLX", "KO", "PEP", "MCD", "IBM", "GS", "DIS", "TSM", "ASML", "CSCO", "ADBE", "QCOM", "ARM", "DELL", "UBER", "PFE", "BLK", "AMAT", "NKE", "BX", "MA", "V"]

lock = threading.Lock()

def convert_nan_to_none(value):
  return None if pd.isna(value) else value

def insert_report_quarter_data(ticker_symbol, id):
  ticker = yf.Ticker(ticker=ticker_symbol)
  df = ticker.get_income_stmt(freq="quarterly")
  df = df.T
  df.index.name = "Report Date"
  df = df.filter(items=["TotalRevenue", "NetIncome", "OperatingIncome"])
  df = df.dropna(how="all")
  for index, row in df.iterrows():
    date_obj = datetime.strptime(index.strftime("%Y-%m-%d"), "%Y-%m-%d")
    company = Company.objects.get(ticker_symbol=ticker_symbol)
    report = Report(
        company=company,
        timestamp=date_obj,
        net_income=convert_nan_to_none(row["NetIncome"]),
        total_revenue=convert_nan_to_none(row["TotalRevenue"]),
        operating_income=convert_nan_to_none(row["OperatingIncome"])
      )
    with lock:
      report.save()

def run():
  start = time.time()
  threads = []
  # ticker = yf.Ticker(ticker="AAPL")
  id = 1
  for ticker in other_ticker_list:
    t = threading.Thread(target=insert_report_quarter_data, args=(ticker, id))
    threads.append(t)
    id += 1
  for t in threads:
    t.start()
  for t in threads:
    t.join()
  # symbol = "AAPL"
  # token = "ct335epr01qkff7127d0ct335epr01qkff7127dg"
  # response = requests.get(f"https://finnhub.io/api/v1/stock/financials-reported?symbol={symbol}&from=2023-01-01&to=2024-11-01&freq=quarterly&token={token}")
  # if response.status_code == requests.codes.ok:
  #   data = response.json()["data"]
  #   df = pd.DataFrame(data)
  #   print(df)
  # print(ticker.get_balance_sheet(freq="quarterly"))
  # print(ticker.get_sec_filings())
  # print(ticker.get_cash_flow(freq="quarterly"))
  # print(ticker.get_balance_sheet(freq="yearly"))
  # print(ticker.calendar)
  print(f"Done it took: {time.time() - start} seconds")
