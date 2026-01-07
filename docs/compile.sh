#!/bin/bash
# Script para compilar el documento IEEE de SerenVoice

echo "====================================="
echo "Compilando SerenVoice_IEEE.tex"
echo "====================================="
echo ""

# Verificar si existe el archivo fuente
if [ ! -f "SerenVoice_IEEE.tex" ]; then
    echo "❌ Error: No se encuentra el archivo SerenVoice_IEEE.tex"
    echo "Por favor ejecuta este script desde el directorio docs/"
    exit 1
fi

# Verificar si pdflatex está instalado
if ! command -v pdflatex &> /dev/null; then
    echo "❌ Error: pdflatex no está instalado"
    echo ""
    echo "Para instalar en Ubuntu/Debian:"
    echo "  sudo apt-get install texlive-full"
    echo ""
    echo "Para instalar en macOS:"
    echo "  brew install --cask mactex"
    echo ""
    echo "O usa Overleaf online: https://www.overleaf.com/"
    exit 1
fi

echo "✓ pdflatex encontrado"
echo ""

# Primera compilación
echo "📄 Primera pasada de compilación..."
pdflatex -interaction=nonstopmode SerenVoice_IEEE.tex > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Primera pasada completada"
else
    echo "⚠️  Advertencia: Primera pasada con errores (común en primera ejecución)"
fi

# Segunda compilación para referencias
echo "📄 Segunda pasada de compilación (para referencias)..."
pdflatex -interaction=nonstopmode SerenVoice_IEEE.tex > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Segunda pasada completada"
else
    echo "⚠️  Advertencia: Segunda pasada con errores"
fi

# Verificar que se generó el PDF
if [ -f "SerenVoice_IEEE.pdf" ]; then
    echo ""
    echo "====================================="
    echo "✅ ¡Compilación exitosa!"
    echo "====================================="
    echo ""
    echo "📄 PDF generado: SerenVoice_IEEE.pdf"
    echo ""
    
    # Obtener tamaño del archivo
    SIZE=$(du -h SerenVoice_IEEE.pdf | cut -f1)
    echo "📊 Tamaño del archivo: $SIZE"
    
    # Limpiar archivos auxiliares
    echo ""
    echo "🧹 Limpiando archivos auxiliares..."
    rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.fls *.fdb_latexmk
    echo "✓ Archivos auxiliares eliminados"
    
    echo ""
    echo "Para ver el PDF, ejecuta:"
    echo "  xdg-open SerenVoice_IEEE.pdf    # Linux"
    echo "  open SerenVoice_IEEE.pdf        # macOS"
    echo "  start SerenVoice_IEEE.pdf       # Windows Git Bash"
    
else
    echo ""
    echo "====================================="
    echo "❌ Error en la compilación"
    echo "====================================="
    echo ""
    echo "El PDF no se generó correctamente."
    echo "Para ver los errores detallados, ejecuta:"
    echo "  pdflatex SerenVoice_IEEE.tex"
    echo ""
    echo "Problemas comunes:"
    echo "  - Paquetes de LaTeX faltantes"
    echo "  - Errores de sintaxis en el .tex"
    echo "  - Problemas con codificación UTF-8"
    exit 1
fi

echo ""
