<#
.SYNOPSIS
  Generate responsive JPG and WebP variants for an image (480/900/1600 widths).

.DESCRIPTION
  This script uses ImageMagick's `magick` command when available to create
  resized JPG and WebP files using the naming convention: <name>-480.jpg, -900.jpg, -1600.jpg
  and corresponding .webp files. If ImageMagick is not installed, it will
  attempt to use `cwebp` to generate WebP files from the source but recommends
  installing ImageMagick for full functionality.

.PARAMETER SourcePath
  Path to a source image inside the repo (e.g. assets/Gas_Station-Daylight Main.webp).

.EXAMPLE
  # From repository root (PowerShell)
  .\scripts\generate-image-variants.ps1 -SourcePath "assets/Gas_Station-Daylight Main.webp"

  # Specify custom sizes
  .\scripts\generate-image-variants.ps1 -SourcePath "assets/hero.jpg" -Sizes 320,640,1280
#>

param(
  [Parameter(Mandatory=$false)]
  [string]$SourcePath = "assets/Gas_Station-Daylight Main.webp",
  [int[]]$Sizes = @(480,900,1600),
  [int]$JpgQuality = 85,
  [int]$WebpQuality = 80
)

function Test-CommandExists($cmd){
  return (Get-Command $cmd -ErrorAction SilentlyContinue) -ne $null
}

if(-not (Test-Path $SourcePath)){
  Write-Error "Source file not found: $SourcePath"
  Write-Host "Provide a valid path relative to the repo root. Example: assets/Gas_Station-Daylight Main.webp"
  exit 1
}

$hasMagick = Test-CommandExists magick
$hasCwebp = Test-CommandExists cwebp

Write-Host "Source:" $SourcePath
Write-Host "ImageMagick (magick):" ($hasMagick ? 'found' : 'not found')
Write-Host "cwebp:" ($hasCwebp ? 'found' : 'not found')

if(-not $hasMagick -and -not $hasCwebp){
  Write-Warning "Neither ImageMagick (magick) nor cwebp were found on PATH."
  Write-Host "Install ImageMagick (https://imagemagick.org) for best results."
  Write-Host "As a fallback you can install libwebp (https://developers.google.com/speed/webp) to get cwebp."
  Write-Host "Exiting."
  exit 1
}

$srcFull = Resolve-Path $SourcePath
$dir = Split-Path $srcFull -Parent
$filename = Split-Path $srcFull -Leaf
$nameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($filename)

foreach($size in $Sizes){
  $outJpg = Join-Path $dir ("$nameNoExt-$size.jpg")
  $outWebp = Join-Path $dir ("$nameNoExt-$size.webp")

  if($hasMagick){
    Write-Host "Generating JPG $outJpg (width: $size)"
    & magick "$srcFull" -resize "${size}x" -quality $JpgQuality "$outJpg"

    Write-Host "Generating WebP $outWebp (width: $size)"
    # magick can write webp directly
    & magick "$srcFull" -resize "${size}x" -quality $WebpQuality "$outWebp"
  }
  else {
    # If magick missing but cwebp exists, attempt to create webp directly from source
    if($hasCwebp){
      Write-Host "ImageMagick not found. Creating WebP only: $outWebp"
      & cwebp -q $WebpQuality "$srcFull" -o "$outWebp" | Out-Null
      Write-Warning "JPG variants were not created because ImageMagick is required to resize and output JPGs."
    }
  }
}

Write-Host "Done. Place the generated files alongside your source in the assets/ folder."
Write-Host "If you used spaces in filenames they are handled automatically by quoting the paths."
