# Serves this folder at http://127.0.0.1:8765/ for Cursor Simple Browser (avoids file:// / https confusion).
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://127.0.0.1:8765/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Open in Simple Browser: ${prefix}index.html"
Write-Host "Press Ctrl+C to stop."
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq "" -or $path -eq "/") { $path = "index.html" }
    $local = Join-Path $root $path
    if (-not (Test-Path $local -PathType Leaf)) {
        $ctx.Response.StatusCode = 404
        $buf = [Text.Encoding]::UTF8.GetBytes("Not found")
        $ctx.Response.OutputStream.Write($buf, 0, $buf.Length)
        $ctx.Response.Close()
        continue
    }
    $ext = [System.Io.Path]::GetExtension($local).ToLowerInvariant()
    $ctype = switch ($ext) {
        ".html" { "text/html; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".svg"  { "image/svg+xml" }
        ".json" { "application/json; charset=utf-8" }
        ".png"  { "image/png" }
        ".jpg"  { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".webp" { "image/webp" }
        ".pdf"  { "application/pdf" }
        default { "application/octet-stream" }
    }
    $ctx.Response.ContentType = $ctype
    $bytes = [System.IO.File]::ReadAllBytes($local)
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
}
