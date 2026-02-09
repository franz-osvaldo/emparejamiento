/**
 * ARCHIVO: script.js
 * DESCRIPCIÓN: Lógica de negocio para GIFT Prompt Architect.
 * ENFOQUE: Manipulación del DOM, Template Strings y File API.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. REFERENCIAS AL DOM (Cacheamos selectores para mejor rendimiento)
    const dom = {
        form: document.getElementById('promptForm'),
        inputs: {
            tema: document.getElementById('tema'),
            audiencia: document.getElementById('audiencia'),
            cantidad: document.getElementById('cantidad'),
            dificultad: document.getElementById('dificultad'),
        },
        container: document.getElementById('resultadoContainer'),
        output: document.getElementById('outputPrompt'),
        actions: {
            generar: document.getElementById('btnGenerar'),
            copiar: document.getElementById('btnCopiar'),
            descargar: document.getElementById('btnDescargar')
        }
    };

    // 2. LÓGICA DE CONSTRUCCIÓN DEL PROMPT
    const buildPrompt = (data) => {
        // Utilizamos Template Literals para mantener el formato exacto solicitado
        return `Actúa como un Diseñador Instruccional Senior y Experto Técnico en Moodle. Tu objetivo es generar ${data.cantidad} preguntas de tipo RELACIONAR COLUMNAS(EMPAREJAMIENTO) en formato GIFT de Moodle sobre el tema: ${data.tema}. El nivel de dificultad de cada pregunta es: ${data.dificultad}. El cuestionario esta dirigido a estudiantes de nivel educativo: ${data.audiencia}.

## FORMATO DE RESPUESTA
1. Formato:  Formato GIFT.
2. Presentación de la respuesta: Dentro de un bloque de código.
3. Número de preguntas: ${data.cantidad} 
4. Asegúrate de que cada pregunta generada esté separada de la siguiente por UNA LÍNEA EN BLANCO
5. Las parejas que se relacionan (emparejan) empiezan con el signo de igual (=) y están separadas con el símbolo "->". Deben de haber al menos tres parejas a relacionar.
6. Usa el siguiente ejemplo para tu respuesta.

~~~
Relacione los siguientes países con sus capitales correspondientes. {
   =Canada -> Ottawa
   =Italia  -> Roma
   =Japón  -> Tokio
   =India  -> Nueva Delhi
}
~~~


## PROTOCOLO DE ESCAPING (CRÍTICO)

**OBLIGATORIO:** Cuando los siguientes símbolos aparezcan en el CONTENIDO (Título, Enunciado, Respuestas o Feedbacks), debes anteponer una barra invertida \`\\\`:

1. **Signo igual \`=\`** → Escribir siempre como \`\\=\`
2. **Dos puntos (crítico) \`:\`** → Escribir siempre como \`\\:\`
3. **Tilde \`~\`** → Escribir siempre como \`\\~\`
4. **Numeral \`#\`** → Escribir siempre como \`\\#\`
5. **Llaves \`{\` y \`}\`** → Escribir siempre como \`\\{\` y \`\\}\`

**EXCEPCIÓN:** NUNCA escapes estos caracteres si forman parte de la sintaxis GIFT:

1. \`::\` al inicio y final del nombre de la pregunta 
2. \`{\` y \`}\` que delimitan el bloque de respuestas 
3. \`=\` antes de la respuesta correcta 
4. \`~\` antes de las respuestas incorrectas 
5. \`#\` antes de cada feedback 
6. \`####\` antes del feedback general

## REGLA DE NO-ESCAPE (Caracteres Literales)
Los siguientes caracteres NO deben llevar barra invertida, ya que son seguros y necesarios para la legibilidad (especialmente en matemáticas):

* Operadores:  \`+\` \`-\` \`*\` \`/\` \`^\`
* Paréntesis: \`(\` \`)\`
* Puntuación: \`.\` \`,\` \`;\` \`"\` \`'\` \`?\` \`!\` \`@\` \`$\` \`|\` \`¡\` \`!\`
* Guiones: \`_\` y \`-\`
* Flechas: \`->\` \`-->\`
`;
    };

    // 3. HANDLER: GENERAR
    const handleGenerate = (e) => {
        e.preventDefault(); // Evitamos el reload del form

        // A. Captura de datos
        const data = {
            tema: dom.inputs.tema.value.trim(),
            audiencia: dom.inputs.audiencia.options[dom.inputs.audiencia.selectedIndex].text,
            cantidad: dom.inputs.cantidad.value,
            dificultad: dom.inputs.dificultad.value
        };

        // B. Validación
        if (!data.tema) {
            alert('Por favor, ingresa un tema para el cuestionario.');
            dom.inputs.tema.focus();
            return;
        }

        // C. Generación
        const promptText = buildPrompt(data);
        dom.output.value = promptText;

        // D. Mostrar Resultado (UI)
        dom.container.hidden = false; // Quitamos el atributo hidden nativo
        
        // E. Scroll suave hacia el resultado
        dom.container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };

    // 4. HANDLER: COPIAR AL PORTAPAPELES
    const handleCopy = async () => {
        const textToCopy = dom.output.value;
        const originalText = dom.actions.copiar.innerText;

        if (!textToCopy) return;

        try {
            // Usamos la API moderna de Clipboard
            await navigator.clipboard.writeText(textToCopy);
            
            // Feedback visual temporal
            dom.actions.copiar.innerText = "¡Copiado! ✅";
            dom.actions.copiar.classList.add('text-success'); // Clase utilitaria sugerida

            setTimeout(() => {
                dom.actions.copiar.innerText = originalText;
                dom.actions.copiar.classList.remove('text-success');
            }, 2000);

        } catch (err) {
            console.error('Error al copiar:', err);
            alert('No se pudo copiar el texto automáticamente.');
        }
    };

    // 5. HANDLER: DESCARGAR .TXT
    const handleDownload = () => {
        const textContent = dom.output.value;
        if (!textContent) return;

        // Creamos un Blob (Objeto binario inmutable tipo archivo)
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        
        // Generamos una URL temporal en memoria
        const url = URL.createObjectURL(blob);
        
        // Creamos un elemento <a> invisible para forzar la descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = 'prompt-moodle.txt';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Limpieza de memoria
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // 6. ASIGNACIÓN DE EVENTOS
    dom.form.addEventListener('submit', handleGenerate); // Usamos submit para mejor accesibilidad (Enter key)
    dom.actions.copiar.addEventListener('click', handleCopy);
    dom.actions.descargar.addEventListener('click', handleDownload);

});