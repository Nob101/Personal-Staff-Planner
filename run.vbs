' NEU: Startet ohne das das cmd sichtbar wird

Set WshShell = CreateObject("WScript.Shell")

WshShell.Run "cmd.exe /c setup_and_run.bat", 0, False

