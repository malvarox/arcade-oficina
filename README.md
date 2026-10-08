# Arcade de la Oficina

Dos juegos en una sola página, hechos para jugar con los compañeros de la oficina:

- **DeathMatch**: pelea 1 vs 1 con 9 luchadores, especiales, súpers y fatalities.
- **DeathKart**: carreras con 9 pilotos, 3 pistas, ítems, derrape con turbo, copa y contrarreloj.

**Para jugar:** https://malvarox.github.io/arcade-oficina/

No hay que instalar nada ni crear cuentas. Funciona en Chrome, Edge, Firefox y Safari actualizados.

## Jugar online en la oficina

1. Abre el link y elige el juego.
2. Entra a **ONLINE** y elige **+ CREAR UNA SALA**. La primera vez te pide un apodo.
3. El link de la sala se copia solo. Pégalo en Teams (o donde sea).
4. Tus compañeros abren ese link y entran directo a tu sala:
   - DeathMatch: 1 vs 1. La pelea empieza sola cuando entra tu rival.
   - DeathKart: hasta 4 personas. El que creó la sala elige pista y aprieta Enter para largar.

Si alguien no tiene el link, puede entrar con **UNIRSE CON CÓDIGO O LINK** y escribir el código de 6 letras que aparece en la pantalla de la sala.

### Si el online no conecta

El online conecta los navegadores directamente entre sí (WebRTC). Algunas redes corporativas lo bloquean. Si pasa eso:

- Prueben todos conectados a la misma red wifi.
- O prueben con los datos del celular (compartiendo internet).
- Si la red de la oficina lo bloquea siempre, hay que pedirle a TI que permita WebRTC hacia `0.peerjs.com` y los servidores STUN/TURN públicos.

## Controles

| | DeathMatch | DeathKart |
|---|---|---|
| Moverse | Flechas | ↑ acelerar · ↓ frenar · ← → girar |
| Acciones | Z golpe · X patada · C y V especiales (mantén para cargar) · C+V súper | Espacio derrape (turbo al soltar) · Z usar ítem |
| Pausa | Esc | Esc |

En el celular aparecen botones en pantalla. En pausa, DeathMatch muestra la lista completa de movimientos de cada luchador.

## Qué se guarda y dónde

- Apodo, ranking, tiempos del contrarreloj y fantasmas se guardan **solo en tu navegador** (localStorage). No hay base de datos ni servidor propio.
- Para conectar a los jugadores se usa el servidor público gratuito de [PeerJS](https://peerjs.com), que solo presenta a los navegadores entre sí. Las partidas viajan directo de un navegador a otro.
- Como en cualquier conexión directa (videollamadas incluidas), los jugadores de una misma sala pueden ver la dirección IP del otro. Comparte el link solo con quienes quieras que entren.

## Seguridad

Ver [SECURITY.md](SECURITY.md).

## Estructura

```
index.html          página (sin código incrustado)
css/arcade.css      estilos
js/arcade.js        los dos juegos y el selector
vendor/             three.js r128 y PeerJS 1.5.4 (copias fijas, ver vendor/LICENSES.md)
```

Los gráficos están dibujados por código (pixel art) y los escenarios 3D usan three.js.
