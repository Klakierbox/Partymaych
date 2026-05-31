import os
import sys
from ftplib import FTP

FTP_HOST = "k-27lab.pl"
FTP_USER = "raspberrypi@k-27lab.pl"
FTP_PASS = "Oper@belchatow23"
LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))

def deploy():
    print("⚡ [PartyMatch Deploy] Inicjalizacja automatycznego wdrażania API PHP...")
    
    # Próba połączenia z FTP
    try:
        ftp = FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Pomyślnie połączono i zalogowano do serwera FTP Hostido.")
    except Exception as e:
        print(f"❌ Połączenie przez {FTP_HOST} nie powiodło się: {e}")
        try:
            ftp = FTP("ftp.k-27lab.pl")
            ftp.login(FTP_USER, FTP_PASS)
            print("✅ Pomyślnie połączono przez ftp.k-27lab.pl.")
        except Exception as e2:
            print(f"❌ Krytyczny błąd połączenia z serwerem FTP: {e2}")
            sys.exit(1)

    # Zapewnienie katalogu partymatch na FTP
    remote_dir = "/partymatch"
    try:
        ftp.cwd(remote_dir)
        print(f"📁 Folder {remote_dir} istnieje na serwerze.")
    except:
        try:
            ftp.mkd(remote_dir)
            print(f"📁 Utworzono nowy folder na serwerze: {remote_dir}")
        except Exception as mkdir_err:
            print(f"⚠️ Błąd przy tworzeniu katalogu {remote_dir}: {mkdir_err}")
            sys.exit(1)

    # Wgrywanie pliku api.php
    local_file = os.path.join(LOCAL_DIR, "api.php")
    remote_file = "api.php"
    
    if not os.path.exists(local_file):
        print(f"❌ Błąd: Nie znaleziono lokalnego pliku {local_file}")
        sys.exit(1)

    print(f"📤 Wysyłanie pliku api.php do {remote_dir}/api.php ... ", end="", flush=True)
    try:
        ftp.cwd(remote_dir)
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        print("OK ✅")
    except Exception as upload_err:
        print(f"BŁĄD ❌ ({upload_err})")
        sys.exit(1)

    ftp.quit()
    print("\n=======================================================")
    print("🎉 Sukces! Pomyślnie wdrożono API PHP na serwerze Hostido.")
    print("🔗 Adres API: https://k-27lab.pl/partymatch/api.php")
    print("=======================================================")

if __name__ == "__main__":
    deploy()
