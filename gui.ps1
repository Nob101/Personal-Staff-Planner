# Wichtig: Aktiviert das Design für Ladebalken
[Windows.Forms.Application]::EnableVisualStyles()
 
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
 
# NEU: HELFER für den Farbmix (Ladebalken)
$code = @"
using System;
using System.Runtime.InteropServices;
public class StyleHelper {
    [DllImport("uxtheme.dll", ExactSpelling=true, CharSet=CharSet.Unicode)]
    public static extern int SetWindowTheme(IntPtr hWnd, String pszSubAppName, String pszSubIdList);
}
"@
Add-Type -TypeDefinition $code
 
 
# NEU: Fenster-Einstellungen (Modern-Retro-Style AOL )
    $form = New-Object Windows.Forms.Form
    $iconPath = "$PSScriptRoot\Frontend\public\PSP_Logo_Transparent.ico"
 
        if (Test-Path $iconPath) {
           try {
        $form.Icon = New-Object System.Drawing.Icon($iconPath)
    } catch {
        # NEU: Falls das Icon-Format fehlerhaft ist, wird der Fehler einfach ignoriert
    }
        }
    $form.Text = 'Personal Staff Planner'
    $form.Size = New-Object Drawing.Size(450,400)
    $form.StartPosition = 'CenterScreen'
 
    $form.BackColor = [Drawing.Color]::FromArgb(240,240,240)
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false
 
 
    $form.TopMost = $false       # Bleibt immer im Vordergrund vor der CMD!!!
    $form.ShowInTaskbar = $false
 
# NEU: Logo-Bereich
$logoPath = Join-Path $PSScriptRoot "Frontend\public\Logo.png"
if (Test-Path $logoPath) {
    $pictureBox = New-Object Windows.Forms.PictureBox
    $pictureBox.Image = [System.Drawing.Image]::FromFile($logoPath)
 
    $pictureBox.Location = New-Object Drawing.Point(75, 20) # Zentriert
    $pictureBox.Size = New-Object Drawing.Size(300, 120)    # Größerer Bereich
 
    $pictureBox.SizeMode = 'Zoom'
    $form.Controls.Add($pictureBox)
}
 
# NEU: Titel kleiner und modernere Schrift
$label = New-Object Windows.Forms.Label
$label.Text = 'PSP - DIENSTPLAN'
$label.Location = New-Object Drawing.Point(20,160)
$label.Size = New-Object Drawing.Size(400,30)
$label.TextAlign = 'MiddleCenter'
 
# Segoe UI -> moderne Standard-Windows Schrift
$label.Font = New-Object Drawing.Font('Segoe UI', 14, [Drawing.FontStyle]::Bold)
$label.ForeColor = [Drawing.Color]::FromArgb(45, 45, 45) # Dunkelgrau
$form.Controls.Add($label)
 
# --- Status Text ---
$status = New-Object Windows.Forms.Label
$status.Text = 'System wird initialisiert...'
$status.Location = New-Object Drawing.Point(35,225)
 
    $status.Size = New-Object Drawing.Size(380,20)
    $status.Font = New-Object Drawing.Font('Segoe UI', 9)
    $form.Controls.Add($status)
 
# NEU: --- Ladebalken => Marquee anstelle Continouse ---
$bar = New-Object Windows.Forms.ProgressBar
$bar.Location = New-Object Drawing.Point(35,255)
$bar.Size = New-Object Drawing.Size(365,25)
 
$bar.Style = 'Continous'  # Status des Ladebalken in Prozent
$bar.Minimum = 0
$bar.Maximum = 100
$form.Controls.Add($bar)
 
# NEU: Fenster anzeige & Theme-Override
$form.Add_Shown({
    # Deaktiviert das Windows-Blau und erlaubt ForeColor (Gruen)
    [StyleHelper]::SetWindowTheme($bar.Handle, "", "")
    $bar.ForeColor = [Drawing.Color]::LimeGreen
})
 
# NEU: Fenster anzeigen /texte
$form.Show()
for($i = 0; $i -le 100; $i++) {
    $bar.Value = $i
   
    # Texte basierend auf dem echten Fortschritt (%)
    if ($i -eq 5)  { $status.Text = "Docker-Umgebung starten..." }
    if ($i -eq 25) { $status.Text = "Datenbank wird gesucht..." }
    if ($i -eq 45) { $status.Text = "Netzwerk-Routing wird konfiguriert..." }
    if ($i -eq 65) { $status.Text = "Backend wird gestartet..." }
    if ($i -eq 85) { $status.Text = "Nginx Reverse-Proxy wird geladen..." }
    if ($i -eq 98) { $status.Text = "Starte Programm...." }
 
    [System.Windows.Forms.Application]::DoEvents()
   
    # Geschwindigkeit: 180ms * 100 Schritte = ca. 18 Sekunden Ladezeit
    # Standard zeit für Docker
    Start-Sleep -Milliseconds 180
}
 
# Aber falls Docker schneller war, bleibt das Fenster offen bis zum Kill durch Batch
while($true) {
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 100
}