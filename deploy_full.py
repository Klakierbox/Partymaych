import os
import sys
from ftplib import FTP

FTP_HOST = "k-27lab.pl"
FTP_USER = "raspberrypi@k-27lab.pl"
FTP_PASS = "Oper@belchatow23"
LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))

def deploy():
    print("⚡ [PartyMatch Full Deploy] Rozpoczęcie wgrywania gry na serwer Hostido...")
    
    # Połączenie FTP
    try:
        ftp = FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Połączono z FTP Hostido.")
    except Exception as e:
        try:
            ftp = FTP("ftp.k-27lab.pl")
            ftp.login(FTP_USER, FTP_PASS)
            print("✅ Połączono przez ftp.k-27lab.pl.")
        except Exception as e2:
            print(f"❌ Błąd połączenia FTP: {e2}")
            sys.exit(1)

    # Zapewnienie, że folder /partymatch istnieje
    remote_dir = "/partymatch"
    try:
        ftp.cwd(remote_dir)
    except:
        try:
            ftp.mkd(remote_dir)
            ftp.cwd(remote_dir)
            print(f"📁 Utworzono katalog: {remote_dir}")
        except Exception as mkdir_err:
            print(f"❌ Błąd tworzenia katalogu {remote_dir}: {mkdir_err}")
            sys.exit(1)

    # Lista plików do wdrożenia
    files_to_upload = ["index.html", "style.css", "app.js", "api.php"]
    
    for file_name in files_to_upload:
        local_path = os.path.join(LOCAL_DIR, file_name)
        if not os.path.exists(local_path):
            print(f"❌ Błąd: Brak lokalnego pliku {file_name}")
            continue
            
        print(f"📤 Wysyłanie: {file_name} ... ", end="", flush=True)
        try:
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {file_name}', f)
            print("OK ✅")
        except Exception as upload_err:
            print(f"BŁĄD ❌ ({upload_err})")

    ftp.quit()
    print("\n=======================================================")
    print("🎉 SUKCES! Gra PartyMatch została wgrana bezpośrednio na serwer!")
    print("🔗 Adres gry (HTTP): http://k-27lab.pl/partymatch/")
    print("=======================================================")

if __name__ == "__main__":
    deploy()
