# Documentación IEEE - SerenVoice

Este directorio contiene el documento académico IEEE sobre el proyecto SerenVoice en formato LaTeX.

## 📄 Archivos

- `SerenVoice_IEEE.tex` - Documento principal en formato LaTeX usando la plantilla IEEE
- `SerenVoice_IEEE.pdf` - Documento compilado en PDF (generado)

## 🔧 Requisitos para Compilar

Para compilar el documento LaTeX necesitas:

### Opción 1: Distribución LaTeX Completa (Recomendada)

**En Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install texlive-full
```

**En macOS:**
```bash
brew install --cask mactex
```

**En Windows:**
- Descargar e instalar [MiKTeX](https://miktex.org/download) o [TeX Live](https://www.tug.org/texlive/)

### Opción 2: Distribución LaTeX Mínima

Si prefieres una instalación más ligera:

**En Linux:**
```bash
sudo apt-get install texlive-latex-base texlive-latex-extra texlive-lang-spanish
```

### Opción 3: Overleaf (Online - Sin Instalación)

1. Ve a [Overleaf](https://www.overleaf.com/)
2. Crea una cuenta gratuita
3. Sube el archivo `SerenVoice_IEEE.tex`
4. Compila online y descarga el PDF

## 📝 Compilación

### Método 1: Usando pdflatex (Recomendado)

```bash
cd docs
pdflatex SerenVoice_IEEE.tex
pdflatex SerenVoice_IEEE.tex  # Segunda pasada para referencias
```

### Método 2: Usando latexmk (Automático)

```bash
cd docs
latexmk -pdf SerenVoice_IEEE.tex
```

### Método 3: Script de compilación

En Linux/macOS:
```bash
cd docs
chmod +x compile.sh
./compile.sh
```

## 📋 Contenido del Documento

El documento IEEE incluye las siguientes secciones:

1. **Abstract/Resumen** - Resumen ejecutivo del proyecto
2. **Introducción** - Contexto y motivación
3. **Revisión de Literatura** - Estado del arte en análisis de voz y detección emocional
4. **Metodología** - Arquitectura del sistema y enfoque técnico
   - Arquitectura de tres capas
   - Procesamiento de audio
   - Extracción de características
   - Modelo CNN
   - Algoritmo de detección de estrés
5. **Implementación Técnica** - Detalles de implementación
   - Módulos del backend
   - Módulos del frontend
   - Base de datos
   - Seguridad
6. **Resultados** - Funcionalidades y rendimiento
7. **Discusión** - Ventajas, limitaciones y trabajo futuro
8. **Conclusiones** - Resumen de logros y aportaciones
9. **Referencias** - Bibliografía académica

## 🎨 Formato IEEE

El documento utiliza la plantilla oficial de IEEE para conferencias (`IEEEtran`), que incluye:

- Formato de dos columnas
- Tipografía Times Roman 10pt
- Márgenes estándar IEEE
- Numeración automática de secciones
- Formato de referencias IEEE estándar
- Soporte completo para español

## 🌐 Idioma

El documento está completamente en **español** incluyendo:
- Todo el contenido textual
- Títulos y subtítulos
- Palabras clave
- Referencias bibliográficas

## 📊 Figuras y Diagramas

El documento incluye descripciones textuales de:
- Arquitectura del sistema
- Flujo de procesamiento de audio
- Estructura de base de datos
- Componentes del sistema

Para agregar figuras reales, coloca las imágenes en la carpeta `docs/figures/` y descomenta las secciones correspondientes en el archivo `.tex`.

## ✅ Verificación

Después de compilar, verifica que:
- [ ] El PDF se generó correctamente
- [ ] Todas las secciones están presentes
- [ ] Las referencias están numeradas correctamente
- [ ] No hay errores de LaTeX
- [ ] El formato de dos columnas se mantiene
- [ ] Los caracteres en español (ñ, á, é, í, ó, ú) se muestran correctamente

## 🔍 Solución de Problemas

### Error: "File 'IEEEtran.cls' not found"
**Solución:** Instala el paquete completo de LaTeX o descarga `IEEEtran.cls` de [CTAN](https://ctan.org/pkg/ieeetran)

### Error con caracteres españoles
**Solución:** Asegúrate de que tu editor use codificación UTF-8

### Error con babel
**Solución:** Instala `texlive-lang-spanish`:
```bash
sudo apt-get install texlive-lang-spanish
```

### Referencias no aparecen
**Solución:** Ejecuta pdflatex dos veces para generar las referencias correctamente

## 📤 Exportar

Para compartir el documento:

1. **Solo PDF**: Comparte `SerenVoice_IEEE.pdf`
2. **Código fuente**: Comparte `SerenVoice_IEEE.tex` (requiere LaTeX para compilar)
3. **Proyecto completo**: Comparte toda la carpeta `docs/`

## 📞 Soporte

Para más información sobre:
- LaTeX: [LaTeX Project](https://www.latex-project.org/)
- Plantilla IEEE: [IEEE Author Center](https://www.ieee.org/publications/authors/author-templates.html)
- Overleaf: [Overleaf Documentation](https://www.overleaf.com/learn)

## 📝 Notas

- El documento sigue estrictamente el formato IEEE para publicaciones académicas
- Todas las secciones técnicas están basadas en la implementación real del proyecto
- Las referencias incluyen tanto papers académicos como documentación técnica oficial
- El documento puede ser usado para presentaciones académicas, tesis, o publicaciones

---

**Generado para:** SerenVoice - Plataforma Integral de Análisis de Voz con IA  
**Formato:** IEEE Conference Paper  
**Idioma:** Español  
**Fecha:** Enero 2026
