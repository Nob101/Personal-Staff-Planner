# Wichtig: Aktiviert das Design für Ladebalken
[Windows.Forms.Application]::EnableVisualStyles()

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing



# Fenster-Einstellungen (Retro-Style AOL oder So)
    $form = New-Object Windows.Forms.Form
    $iconPath = "$PSScriptRoot\Frontend\public\PSP_Logo_Transparent.ico"

        if (Test-Path $iconPath) {
            $form.Icon = New-Object System.Drawing.Icon($iconPath)
        }
    $form.Text = 'Personal Staff Planner'
    $form.Size = New-Object Drawing.Size(450,380)
    $form.StartPosition = 'CenterScreen'

    $form.BackColor = [Drawing.Color]::FromArgb(192,192,192) 
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false


    $form.TopMost = $false       # Bleibt immer im Vordergrund vor der CMD!!!
    $form.ShowInTaskbar = $false

# NEU: Logo-Bereich
$logoPath = Join-Path $PSScriptRoot "Frontend\src\assets\Logo.png"
if (Test-Path $logoPath) {
    $pictureBox = New-Object Windows.Forms.PictureBox
    $pictureBox.Image = [System.Drawing.Image]::FromFile($logoPath)

    $pictureBox.Location = New-Object Drawing.Point(125, 20)
    $pictureBox.Size = New-Object Drawing.Size(200, 100)
    $pictureBox.SizeMode = 'Zoom'

    $form.Controls.Add($pictureBox)
}

# --- Titel ---
$label = New-Object Windows.Forms.Label
$label.Text = 'PSP - DIENSTPLAN'
$label.Location = New-Object Drawing.Point(20,140)
$label.Size = New-Object Drawing.Size(400,40)
$label.TextAlign = 'MiddleCenter'

$label.Font = New-Object Drawing.Font('MS Sans Serif', 18, [Drawing.FontStyle]::Bold)
$label.ForeColor = [Drawing.Color]::Navy
$form.Controls.Add($label)

# --- Status Text ---
$status = New-Object Windows.Forms.Label
$status.Text = 'Verbindung wird aufgebaut...'
$status.Location = New-Object Drawing.Point(25,210)

    $status.Size = New-Object Drawing.Size(400,20)
    $status.Font = New-Object Drawing.Font('MS Sans Serif', 10)
    $form.Controls.Add($status)

# NEU: --- Ladebalken => Marquee anstelle Continouse ---
$bar = New-Object Windows.Forms.ProgressBar
$bar.Location = New-Object Drawing.Point(25,240)
$bar.Size = New-Object Drawing.Size(380,30)

$bar.Style = 'Continous'  # Status des Ladebalken in Prozent
$bar.Minimum = 0
$bar.Maximum = 100
$form.Controls.Add($bar)

# Fenster anzeigen
$form.Show()
for($i = 0; $i -le 100; $i++) {
    $bar.Value = $i
    
    # Texte basierend auf dem echten Fortschritt (%)
    if ($i -eq 5)  { $status.Text = "Datenbank verbindung..." }
    if ($i -eq 20) { $status.Text = "Suche..." }
    if ($i -eq 40) { $status.Text = "Erstelle Zugriff..." }
    if ($i -eq 60) { $status.Text = "Initialisiere Docker-Daemon..." }
    if ($i -eq 80) { $status.Text = "Starte Nginx-Proxy-Server..." }
    if ($i -eq 95) { $status.Text = "Verbindung wird aufgebaut..." }

    [System.Windows.Forms.Application]::DoEvents()
    
    # Geschwindigkeit: 200ms * 100 Schritte = ca. 20 Sekunden Ladezeit
    # Standard zeit für Docker
    Start-Sleep -Milliseconds 200 
}

# Aber falls Docker schneller war, bleibt das Fenster offen bis zum Kill durch Batch
while($true) {
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 100
}


