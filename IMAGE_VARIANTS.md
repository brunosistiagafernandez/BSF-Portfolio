# Generar variantes de imágenes para responsive (JPG + WebP)

Este repositorio usa una convención de nombres para imágenes responsive:

- <name>-480.jpg  (y .webp)
- <name>-900.jpg  (y .webp)
- <name>-1600.jpg (y .webp)

El script incluido `scripts/generate-image-variants.ps1` crea estas variantes a partir de una imagen fuente.

Requisitos recomendados (Windows):

- ImageMagick (magick) — https://imagemagick.org
- opcional: cwebp (libwebp) — https://developers.google.com/speed/webp

Uso rápido (PowerShell, desde la raíz del repo):

```powershell
# Generar variantes para la imagen subida
.\scripts\generate-image-variants.ps1 -SourcePath "assets/Gas_Station-Daylight Main.webp"

# Si quieres tamaños personalizados
.\scripts\generate-image-variants.ps1 -SourcePath "assets/hero.jpg" -Sizes 320,640,1280
```

Qué hace el script:

- Si ImageMagick está instalado (`magick`), crea JPG y WebP redimensionados con la calidad por defecto.
- Si solo `cwebp` está disponible, intentará crear sólo los WebP a partir del archivo fuente.
- El script maneja correctamente nombres con espacios porque se pasan entrecomillados.

Notas:

- Coloca las variantes en la misma carpeta `assets/` donde está la imagen original para que el código del frontend (script.js) pueda construir correctamente los `srcset`.
- Si no quieres instalar herramientas, también puedes crear archivos duplicados con los nombres esperados (por ejemplo copiar el `.webp` existente a `-480.webp`, `-900.webp`, etc.) para evitar 404s hasta que generes versiones optimizadas.
