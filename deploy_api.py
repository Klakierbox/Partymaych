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

    # Wgrywanie pliku api.php bezpośrednio do głównego katalogu (root) jako partymatch-api.php
    local_file = os.path.join(LOCAL_DIR, "api.php")
    remote_file = "partymatch-api.php"
    
    if not os.path.exists(local_file):
        print(f"❌ Błąd: Nie znaleziono lokalnego pliku {local_file}")
        sys.exit(1)

    print(f"📤 Wysyłanie pliku api.php bezpośrednio do katalogu głównego (root) jako {remote_file} ... ", end="", flush=True)
    try:
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        print("OK ✅")
    except Exception as upload_err:
        print(f"BŁĄD ❌ ({upload_err})")
        sys.exit(1)

    ftp.quit()
    print("\n=======================================================")
    print("🎉 Sukces! Pomyślnie wdrożono API PHP na serwerze Hostido.")
    print("🔗 Adres API: https://k-27lab.pl/partymatch-api.php")
    print("=======================================================")

if __name__ == "__main__":
    deploy()
