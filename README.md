# BSF-Portfolio

Instrucciones rápidas para imágenes responsive

El sitio usa variantes escaladas de las imágenes para servir `srcset` y WebP cuando estén disponibles.

Nombres esperados (ejemplo para `assets/hero.jpg`):
- assets/hero-480.jpg
- assets/hero-900.jpg
- assets/hero-1600.jpg
- assets/hero-480.webp
- assets/hero-900.webp
- assets/hero-1600.webp

Puedes generar estas versiones con ImageMagick (ejemplo):

```powershell
magick assets\hero.jpg -resize 480x -quality 80 assets\hero-480.jpg
magick assets\hero.jpg -resize 900x -quality 80 assets\hero-900.jpg
magick assets\hero.jpg -resize 1600x -quality 80 assets\hero-1600.jpg
magick assets\hero.jpg -quality 80 assets\hero-480.webp
```

O con `cwebp` para WebP específico:

```powershell
cwebp -q 80 assets\hero-480.jpg -o assets\hero-480.webp
```

Después de crear los archivos WebP/JPG con estos nombres, el sitio los servirá automáticamente.

