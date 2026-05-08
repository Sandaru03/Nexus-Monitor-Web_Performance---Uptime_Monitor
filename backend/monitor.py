import asyncio
import requests
import socket
import ssl
import time
import os
from datetime import datetime
from database import log_check_result, get_targets

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def get_ssl_expiry_days(hostname: str) -> int:
    try:
        # Strip https:// or http:// and path if any
        hostname = hostname.replace("https://", "").replace("http://", "").split("/")[0]
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                ssl_info = ssock.getpeercert()
                # e.g. 'Oct 29 12:00:00 2024 GMT'
                expire_date_str = ssl_info['notAfter']
                expire_date = datetime.strptime(expire_date_str, "%b %d %H:%M:%S %Y %Z")
                days_left = (expire_date - datetime.utcnow()).days
                return days_left
    except Exception as e:
        print(f"SSL check failed for {hostname}: {e}")
        return 0

def send_telegram_alert(url: str, error_msg: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram configuration missing. Skipping alert.")
        return
        
    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    text = f"🚨 *ALERT: Website Down* 🚨\n\n*URL*: {url}\n*Error*: {error_msg}"
    
    try:
        requests.post(api_url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "Markdown"
        }, timeout=5)
    except Exception as e:
        print(f"Failed to send Telegram alert: {e}")

def check_url(url: str):
    start_time = time.time()
    status = "DOWN"
    ssl_days_left = -1
    
    try:
        # Use requests as requested by requirement
        response = requests.get(url, timeout=10)
        response_time = (time.time() - start_time) * 1000 # in ms
        
        if response.status_code == 200:
            status = "UP"
        else:
            status = "DOWN"
            send_telegram_alert(url, f"Returned status code {response.status_code}")
            
    except requests.RequestException as e:
        response_time = (time.time() - start_time) * 1000
        send_telegram_alert(url, str(e))
        
    if url.startswith("https"):
        ssl_days_left = get_ssl_expiry_days(url)
        
    log_check_result(url, status, response_time, ssl_days_left)
    print(f"Checked {url}: {status} ({response_time:.2f}ms) SSL: {ssl_days_left} days")

async def async_monitor_task():
    while True:
        targets = get_targets()
        print(f"Starting check cycle for {len(targets)} targets...")
        
        # Run synchronous `requests` calls in parallel threads
        loop = asyncio.get_running_loop()
        tasks = [
            loop.run_in_executor(None, check_url, target)
            for target in targets
        ]
        
        await asyncio.gather(*tasks)
        print("Check cycle completed. Sleeping for 60 seconds...")
        await asyncio.sleep(60)

if __name__ == "__main__":
    from database import init_db
    init_db()
    asyncio.run(async_monitor_task())
