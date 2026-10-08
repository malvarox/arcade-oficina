# Seguridad

Es un sitio estático: no hay servidor propio, base de datos, cuentas, contraseñas ni claves de API. Este repositorio no contiene secretos.

## Medidas en el código

- **Sin dependencias remotas en tiempo de ejecución.** three.js y PeerJS están copiados en `vendor/` (versiones fijas, sacadas de npm: `three@0.128.0` y `peerjs@1.5.4`). Si un CDN se viera comprometido, no afecta a este sitio.
- **Integridad de archivos (SRI).** `index.html` carga cada script y la hoja de estilos con su hash `sha384`. Si un archivo se modifica, el navegador se niega a ejecutarlo.
- **Política de seguridad de contenido (CSP) estricta:** solo se ejecutan scripts del propio sitio (`script-src 'self'`), nada de código incrustado ni `eval`; las conexiones solo pueden ir al propio sitio y al servidor de señalización de PeerJS; no se permiten formularios, plugins ni cambios de `base`.
- **Nada de HTML con datos externos.** Todo se dibuja en un `<canvas>`; no se usa `innerHTML` ni nada parecido, así que un apodo o mensaje malicioso no puede inyectar código.
- **Mensajes de red tratados como no confiables:**
  - tamaño máximo por mensaje (24 KB) y máximo de mensajes por segundo por conexión;
  - se parsean como JSON y se limpian: se descartan claves como `__proto__`, `constructor` y `prototype`, y se limita la profundidad, el largo de listas y textos;
  - solo se aceptan los tipos de mensaje esperados;
  - los efectos y sonidos que envía el anfitrión pasan por una lista blanca y con valores acotados (por ejemplo, volumen y duración máximos);
  - el estado de la partida se valida (pistas, pilotos y luchadores deben existir) antes de usarse;
  - los apodos se limitan a 12 caracteres de letras, números y signos simples.
- **Salas cerradas:** el código de sala se genera con `crypto.getRandomValues`; DeathMatch acepta 1 invitado y DeathKart 3 (4 personas en total). Los demás quedan fuera.
- **Si algo falla, el juego sigue:** un error durante una partida online cierra esa partida con un mensaje en vez de congelar la página.

## Pruebas realizadas

Antes de publicar se probó con dos y hasta cinco navegadores reales conectados, incluido un participante malicioso que enviaba: objetos con `__proto__`, tipos inválidos, mensajes de 100 KB, ráfagas de 3.000 mensajes, eventos de sonido con volumen extremo, nombres con HTML y estados de partida corruptos. Resultado: sin contaminación de prototipos, sin código inyectado, sin congelamientos; en el peor caso la partida online se cierra con un aviso.

## Límites conocidos

- WebRTC comparte la IP entre los jugadores de una sala (igual que una videollamada).
- Quien tenga el link de una sala puede entrar mientras haya cupo. Compártelo solo por canales internos.
- El servidor de señalización es el público de PeerJS (`0.peerjs.com`). Si deja de funcionar, el online no conecta (el resto del juego sí).

## Reportar un problema

Abre un issue o escríbele al dueño del repositorio.
