@echo off  
echo -------------------------------------
echo PSP-Dienstplan: System check und start
echo -------------------------------------

if exist "%~dp0gui_ready.tmp" del /f /q "%~dp0gui_ready.tmp" >nul 2>&1

:: NEU: Ladefenster starten mit timeout
start /b powershell  -ExecutionPolicy Bypass -File "%~dp0gui.ps1"
timeout /t 2 /nobreak >nul
 
:: Docker Check & Start
docker info >nul 2>&1
if %errorlevel% neq 0 (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"  
 
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto :wait_docker
)
 
:: Zertifikate & Container Start
if not exist "certs" mkdir certs
if exist "certs\cert.pem" if exist "certs\key.pem" goto :start_docker
 
:: OpenSSL Suche
set "OSSL=openssl"
where openssl >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\usr\bin\openssl.exe" (
        set "OSSL=C:\Program Files\Git\usr\bin\openssl.exe"
    ) else if exist "C:\Program Files (x86)\Git\usr\bin\openssl.exe" (
        set "OSSL=C:\Program Files (x86)\Git\usr\bin\openssl.exe"
    ) else (
        :: Abbruchbedingung: Falls OpenSSL fehlt
        powershell -Command "Stop-Process -Name 'powershell' -Force" >nul 2>&1
        msg * "FEHLER: OpenSSL wurde nicht gefunden! Bitte Git for Windows installieren."
        exit /b
    )
)

"%OSSL%" req -x509 -newkey rsa:4096 -keyout certs\key.pem -out certs\cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost" >nul 2>&1
 
:: ...
:: NEU: Verbesserter Docker Startprozess
:start_docker
echo [INFO] Pruefe Container-Status...
:: Existiert Container ueberhaupt? (auch wenn sie gestoppt sind)
docker compose ps -a | findstr "psp_backend" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Erstmaliger Setup: Baue Images und starte Container...
    docker compose up --build -d
) else (
    echo [INFO] Container vorhanden. Starte System...
    :: NEU: Damit bei Änderungen im Image die Dockerfiles miteinbezogen werden
    docker compose up  -d
)
:: NEU: curl ist schneller als ps (standard bei 10/11) NEU : Wartet bis Nginx wirklich antwortet!!!!! -_-
:: Reverse_Proxy oft schneller als node.js antworten kann -> 200 und 502 abwarten (Endlosschleife verhinderen)
set /a retry_count=0
:loop
set /a retry_count+=1
if %retry_count% gtr 30 (
    echo [WARN] Server startet langsam. Oeffne Browser trotzdem...
    goto :open_browser
)

echo [INFO] Warte auf Server... (Versuch: %retry_count%/30)

:: -k = ignoriere selbstsigniertes SSL, -s = silent, --connect-timeout = bricht nach 2 Sek ab, falls Nginx blockiert
curl -k -s --connect-timeout 2 https://localhost >nul 2>&1

:: NEW: Statuscode weg. (entweder oder!)
:: Wenn curl Erfolg hat (Errorlevel 0 -> Nginx antwortet!)
if %errorlevel% equ 0 (
    echo [INFO] Server ist erreichbar!
    ::INFO:: Kurze pause, damit Node/Express im Container wirklich bereit ist!!
    timeout /t 2 /nobreak >nul
    goto :open_browser
)

::NEW: Falls Server noch gar nicht reagiert, 2 Sekunden warten und erneut pruefen
timeout /t 2 /nobreak >nul
goto :loop

:open_browser 
:: NEU: Signal-Datei fuer die GUI schreiben (PowerShell schliesst sich dadurch selbst)
:: echo done > "%~dp0gui_ready.tmp"
::FIX: Dateisystem eine Sekunde Zeit geben, um die Datei-Erstellung zu registrieren
timeout /t 2 /nobreak >nul

:: Browser suche ueber Pfad (Nutzt nur vorhandenen)
 
:: Edge
set "EDGE_PATH="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
 
if defined EDGE_PATH (
    start "" "%EDGE_PATH%" --app=https://localhost
    exit
)
 
:: Chrome
set "CHROME_PATH="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
 
if defined CHROME_PATH (
    start "" "%CHROME_PATH%" --app=https://localhost
    exit
)
 
:: Mozilla Firefox
set "FF_PATH="
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" set "FF_PATH=C:\Program Files\Mozilla Firefox\firefox.exe"
if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" set "FF_PATH=C:\Program Files (x86)\Mozilla Firefox\firefox.exe"
 
if defined FF_PATH (
    start "" "%FF_PATH%" --new-window https://localhost
    exit
)
 
:: Fallback, wenn kein Browser gefunden wird (nutzt Windows-Standard)
start https://localhost
exit