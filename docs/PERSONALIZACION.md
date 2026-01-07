# Guía de Personalización del Documento IEEE

Esta guía te ayudará a personalizar el documento IEEE de SerenVoice según tus necesidades.

## 🎨 Secciones Personalizables

### 1. Información de Autores (Líneas 13-21)

**Ubicación**: Línea ~17 en `SerenVoice_IEEE.tex`

**Actual**:
```latex
\author{\IEEEauthorblockN{Equipo SerenVoice}
\IEEEauthorblockA{\textit{Departamento de Ingeniería de Software} \\
\textit{Universidad}\\
Ciudad, País \\
email@universidad.edu}
}
```

**Personalizar con**:
```latex
\author{\IEEEauthorblockN{Juan Pérez\IEEEauthorrefmark{1}, María García\IEEEauthorrefmark{2}}
\IEEEauthorblockA{\IEEEauthorrefmark{1}\textit{Departamento de Ingeniería de Software} \\
\textit{Universidad Tecnológica Nacional}\\
Buenos Aires, Argentina \\
jperez@utn.edu.ar}
\IEEEauthorblockA{\IEEEauthorrefmark{2}\textit{Departamento de Salud Mental} \\
\textit{Universidad de Chile}\\
Santiago, Chile \\
mgarcia@uchile.cl}
}
```

### 2. Título del Documento (Línea 9)

**Actual**:
```latex
\title{SerenVoice: Plataforma Integral de Análisis de Voz...}
```

**Puedes ajustar** el subtítulo o hacer el título más conciso según la conferencia/journal.

### 3. Abstract (Líneas 23-26)

El abstract está completo pero puedes:
- Acortar para cumplir límites de caracteres
- Enfatizar diferentes aspectos según la audiencia
- Agregar resultados cuantitativos específicos si los tienes

### 4. Palabras Clave (Línea 28)

**Actual**:
```latex
\begin{IEEEkeywords}
Análisis de voz, detección de emociones, inteligencia artificial, aprendizaje profundo, procesamiento de señales, salud mental, estrés, ansiedad, CNN, Flask, React
\end{IEEEkeywords}
```

**Puedes** ajustar según los keywords del journal/conferencia objetivo.

### 5. Métricas de Rendimiento (Sección 6.2)

**Ubicación**: Buscar "Rendimiento del Sistema"

**Actualizar con datos reales**:
```latex
\subsubsection{Precisión del Modelo}
En evaluación con conjunto de validación:
\begin{itemize}
\item Clasificación de emociones: ~75-80\% accuracy  % ACTUALIZAR
\item Detección de estrés alto: ~82\% sensitivity    % ACTUALIZAR
\item Detección de ansiedad: ~78\% sensitivity       % ACTUALIZAR
\end{itemize}
```

### 6. Casos de Uso (Sección 6.3)

Puedes agregar casos de uso reales de tu proyecto:
```latex
\subsubsection{Caso 4: [Tu Caso]}
Descripción de un caso de uso real específico de tu implementación...
```

### 7. Agradecimientos (Opcional)

Agregar antes de las referencias:
```latex
\section*{Agradecimientos}
Los autores desean agradecer a [institución/persona] por [motivo].
Este trabajo fue parcialmente financiado por [fuente de financiamiento].
```

### 8. Referencias

**Actualizar con referencias específicas**:

Agregar referencias de tu investigación:
```latex
\bibitem{refN} Tu Nombre, et al. ``Título de tu paper previo,'' 
Nombre de Conferencia, año.
```

### 9. Figuras y Diagramas

Para agregar figuras al documento:

**Paso 1**: Crear carpeta para figuras
```bash
mkdir docs/figures
```

**Paso 2**: Agregar figura en LaTeX
```latex
\begin{figure}[htbp]
\centerline{\includegraphics[width=\columnwidth]{figures/arquitectura.png}}
\caption{Arquitectura del Sistema SerenVoice.}
\label{fig:arquitectura}
\end{figure}
```

**Paso 3**: Referenciar en el texto
```latex
Como se muestra en la Fig.~\ref{fig:arquitectura}, la arquitectura...
```

### 10. Tablas

Ejemplo de tabla personalizable:

```latex
\begin{table}[htbp]
\caption{Comparación de Resultados}
\begin{center}
\begin{tabular}{|c|c|c|}
\hline
\textbf{Métrica} & \textbf{Nuestro} & \textbf{Baseline} \\
\hline
Precisión & 78\% & 65\% \\
Recall & 75\% & 62\% \\
F1-Score & 76.5\% & 63.5\% \\
\hline
\end{tabular}
\label{tab:resultados}
\end{center}
\end{table}
```

## 🔧 Ajustes Técnicos

### Cambiar Márgenes (No recomendado para IEEE)

Si necesitas ajustar márgenes (solo para versiones no-IEEE):
```latex
\usepackage[margin=1in]{geometry}
```

### Cambiar Tamaño de Fuente (Mantener 10pt para IEEE)

IEEE requiere 10pt, pero si necesitas cambiarlo:
```latex
\documentclass[conference,12pt]{IEEEtran}  % Para 12pt
```

### Agregar Más Paquetes

Si necesitas funcionalidad adicional:
```latex
% Después de los paquetes existentes
\usepackage{listings}       % Para código fuente
\usepackage{booktabs}       % Para tablas profesionales
\usepackage{tikz}           % Para diagramas
\usepackage{subcaption}     % Para subfiguras
```

## 📝 Secciones que NO Debes Cambiar

Para mantener el formato IEEE, **NO cambies**:

- ❌ La clase del documento (`\documentclass[conference]{IEEEtran}`)
- ❌ El formato de dos columnas
- ❌ Los márgenes estándar
- ❌ El tamaño de fuente base (10pt)
- ❌ El estilo de referencias

## 🎯 Personalizaciones Comunes por Tipo de Publicación

### Para Conferencia
- Mantén el abstract corto (150-200 palabras)
- Enfatiza resultados y contribuciones
- Incluye comparación con trabajos relacionados

### Para Journal
- Expande la revisión de literatura
- Agrega más detalles de implementación
- Incluye análisis estadístico más profundo
- Agrega sección de "Threats to Validity"

### Para Tesis
- Expande todas las secciones
- Agrega capítulo de "Trabajo Relacionado" separado
- Incluye apéndices con código/datos
- Agrega sección de "Contribuciones"

## 🔍 Checklist de Personalización

Antes de enviar tu documento, verifica:

- [ ] Nombres de autores actualizados
- [ ] Afiliaciones institucionales correctas
- [ ] Emails de contacto válidos
- [ ] Métricas de rendimiento actualizadas con datos reales
- [ ] Referencias verificadas y completas
- [ ] Figuras y tablas con numeración correcta
- [ ] Abstract dentro del límite de palabras
- [ ] Keywords apropiadas para la venue
- [ ] Todas las secciones revisadas
- [ ] Compilación sin errores

## 💡 Tips Profesionales

1. **Siempre compila dos veces** para actualizar referencias
2. **Usa etiquetas descriptivas** para referencias (`\label{fig:arquitectura}`)
3. **Mantén consistencia** en terminología técnica
4. **Revisa ortografía** especialmente en español
5. **Backup regular** del archivo .tex

## 🚀 Flujo de Trabajo Recomendado

1. **Copia el archivo original**
   ```bash
   cp SerenVoice_IEEE.tex SerenVoice_IEEE_v2.tex
   ```

2. **Edita la copia**
   - Actualiza información de autores
   - Personaliza contenido

3. **Compila y revisa**
   ```bash
   pdflatex SerenVoice_IEEE_v2.tex
   ```

4. **Itera hasta estar satisfecho**

5. **Genera versión final**
   ```bash
   ./compile.sh
   ```

## 📞 Recursos Adicionales

- **Plantilla IEEE**: https://www.ieee.org/conferences/publishing/templates.html
- **Guía de Estilo IEEE**: https://journals.ieeeauthorcenter.ieee.org/
- **LaTeX Wikibook**: https://en.wikibooks.org/wiki/LaTeX
- **Overleaf Templates**: https://www.overleaf.com/latex/templates

---

**¡Importante!**: Siempre mantén una copia de respaldo antes de hacer cambios significativos.
