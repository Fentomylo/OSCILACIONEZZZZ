import brunoImg from '../bruno.jpg';
import moritaImg from '../morita.jpg';
import gatovichImg from '../gatovich.jpg';
import telarañaImg from '../ARAÑA.jpg';
import salonImg from '../SALON.jpg';
import unoVideo from '../UNO.mp4';
import ejemploImg from '../EJEMPLO.jpg';
import { activateAranavirus } from '../simulation/createSimulation.js';
import { POWERPOINT_BODY, initPowerPoint } from './powerpoint.js';

function buildStartMenuContent(container) {
  container.innerHTML = '';
  container.style.cssText = `
    font-family: 'Segoe UI', Tahoma, sans-serif;
    font-size: 11px;
    color: #000;
    background: #fff;
    width: 410px;
    height: 480px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    user-select: none;
    border-radius: 0;
    overflow: hidden;
    box-shadow: 4px 4px 14px rgba(0,0,0,0.45);
  `;

  // Top User Header (Windows XP Style)
  const userHeader = document.createElement('div');
  userHeader.style.cssText = `
    background: linear-gradient(180deg, #325da8 0%, #20458c 100%);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 2px solid #e78d1f;
    color: #fff;
    flex-shrink: 0;
  `;
  userHeader.innerHTML = `
    <div style="width: 44px; height: 44px; border: 2px solid #fff; border-radius: 4px; overflow: hidden; background: #000; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.5);">
      <img src="${brunoImg}" style="width: 100%; height: 100%; object-fit: cover;" alt="Avatar" />
    </div>
    <div style="font-size: 15px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.6); letter-spacing: 0.3px;">Tomy</div>
  `;
  container.append(userHeader);

  // Two Column Body
  const bodyColumns = document.createElement('div');
  bodyColumns.style.cssText = `
    display: flex;
    flex: 1;
    overflow: hidden;
  `;

  // Columna de atajos (estilo XP azul) — es lo único que queda del menú
  // Start: ya no hay controles de simulación, solo decoración visual.
  const rightCol = document.createElement('div');
  rightCol.style.cssText = `
    flex: 1;
    background: #d3e5f5;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow-y: auto;
    font-size: 11px;
  `;

  const shortcuts = [
    { icon: '🎨', label: 'Microsoft Paint (XP)' },
    { icon: '🖌️', label: 'Paint 3D' },
    { icon: '📄', label: 'Word' },
    { icon: '📊', label: 'Excel' },
    { icon: '📈', label: 'Power Point' },
    { icon: '🧮', label: 'Calculator' },
    { icon: '📝', label: 'Notepad' },
    { icon: '📁', label: 'My Documents' },
    { icon: '🖼️', label: 'My Pictures' },
    { icon: '🎵', label: 'My Music' },
    { icon: '💻', label: 'My Computer' },
    { icon: '⚙️', label: 'Control Panel' },
    { icon: '🔍', label: 'Search' },
    { icon: '❓', label: 'Help and Support' }
  ];

  shortcuts.forEach(s => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-weight: normal;
      color: #000;
    `;
    item.innerHTML = `<span style="font-size: 13px;">${s.icon}</span> <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.label}</span>`;
    item.addEventListener('mouseenter', () => { item.style.background = '#316ac5'; item.style.color = '#fff'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; item.style.color = '#000'; });
    rightCol.append(item);
  });

  bodyColumns.append(rightCol);
  container.append(bodyColumns);

  // Bottom Footer Bar (Log off / Turn Off)
  const footerBar = document.createElement('div');
  footerBar.style.cssText = `
    background: linear-gradient(180deg, #3b6ea5 0%, #28518c 100%);
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #7f9db9;
    flex-shrink: 0;
  `;
  footerBar.innerHTML = `
    <div style="display: flex; align-items: center; gap: 4px; color: #fff; cursor: pointer; font-size: 11px;">
      <span style="background: #e08214; padding: 2px 4px; border-radius: 2px; font-size: 10px;">🔑</span> <span>Log off</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; color: #fff; cursor: pointer; font-size: 11px;">
      <span style="background: #d93a3a; padding: 2px 4px; border-radius: 2px; font-size: 10px;">🔴</span> <span>Turn Off Computer</span>
    </div>
  `;
  container.append(footerBar);
}

// Clase de insignia "glossy" (Frutiger Aero / Vista) por tipo de ventana —
// ver .icon-badge en styles.css
const ICON_BADGE_CLASS = {
  youtube: 'icon-badge--youtube',
  firefox: 'icon-badge--firefox',
  files: 'icon-badge--files',
  player: 'icon-badge--player',
  paint: 'icon-badge--paint',
  gmail: 'icon-badge--gmail',
  gallery: 'icon-badge--gallery',
  messenger: 'icon-badge--messenger',
  trash: 'icon-badge--trash',
  powerpoint: 'icon-badge--powerpoint'
};

const WINDOW_DEFS = {
  youtube: {
    title: 'YouTube', icon: '▶️',
    body: `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; background: #fff; display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; user-select: none;">

        <!-- Cabecera -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 12px 4px; border-bottom: 3px solid #e6e6e6; flex-shrink: 0;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="background: #cc0000; color: #fff; font-weight: 900; font-size: 18px; padding: 2px 6px; border-radius: 3px; font-family: Arial, sans-serif;">You<span style="background:#fff; color:#cc0000; padding: 0 3px; border-radius: 2px;">Tube</span></span>
            </div>
            <div style="font-size: 9px; color: #666; font-weight: bold; margin-top: 2px;">Broadcast Yourself™</div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #3388dd; display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
            <div>Sign Up | My Account | History | Help | <span style="color:#000;">Log In</span></div>
            <div style="display: flex; align-items: center; gap: 4px; background: #f2f2f2; border: 1px solid #ccc; border-radius: 3px; padding: 2px 6px;">
              <input type="text" style="border: none; outline: none; font-size: 10px; width: 150px; background: transparent;" placeholder="Buscar" />
              <span style="color: #444;">🔍</span>
            </div>
          </div>
        </div>

        <!-- Barra de pestañas -->
        <div style="display: flex; gap: 14px; padding: 6px 12px; background: #f6f6f6; border-bottom: 1px solid #ddd; font-size: 10px; font-weight: bold; color: #555; flex-shrink: 0;">
          <span style="color: #cc0000; border-bottom: 2px solid #cc0000; padding-bottom: 4px;">Videos</span>
          <span>Categories</span>
          <span>Channels</span>
          <span>Community</span>
        </div>

        <!-- Cuerpo -->
        <div style="flex: 1; overflow-y: auto; padding: 10px 12px;">
          <div style="font-size: 15px; font-weight: bold; color: #222; margin-bottom: 6px;">uno.mp4</div>

          <div style="display: flex; gap: 12px;">

            <!-- Columna del video -->
            <div style="flex: 1; min-width: 0;">
              <video class="yt-video" src="${unoVideo}" controls playsinline style="display: block; width: 100%; height: auto; background: #000;"></video>

              <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                <button class="yt-back" title="Retroceder 10s" style="background: #f0f0f0; border: 1px solid #bbb; border-radius: 3px; padding: 3px 8px; font-size: 10px; cursor: pointer;">⏪ 10s</button>
                <button class="yt-fwd" title="Adelantar 10s" style="background: #f0f0f0; border: 1px solid #bbb; border-radius: 3px; padding: 3px 8px; font-size: 10px; cursor: pointer;">10s ⏩</button>
                <button class="yt-mute" title="Silenciar" style="background: #f0f0f0; border: 1px solid #bbb; border-radius: 3px; padding: 3px 8px; font-size: 10px; cursor: pointer;">🔊 Silenciar</button>
              </div>

              <div style="display: flex; gap: 14px; margin-top: 8px; padding-bottom: 6px; border-bottom: 1px solid #eee; font-size: 10px; color: #3388dd;">
                <span>📤 Share</span><span>❤️ Favorite</span><span>➕ Add to Playlists</span><span>🚩 Flag</span>
              </div>

              <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 10px; color: #555;">
                <span>Rate:</span><span style="color:#f4b400;">★★★★☆</span>
                <span>Views: 14,289</span>
              </div>

              <div style="margin-top: 10px;">
                <div style="font-weight: bold; font-size: 22px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Comments &amp; Responses</div>
                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee;"><b>usuario_anonimo_22:</b> nadie más vio esto? borren el video ya</div>
                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee;"><b>vigilante_nocturno:</b> yo grabé esto, no debería estar acá</div>

                <div style="font-size: 19px; line-height: 1.7; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee; background: #f7f9fb;">
                  <b>bloque314_archivo:</b>
                  Pequeñas historias ambientadas en el mismo universo desde la perspectiva de otros personajes.<br/>
                  Al final de cada video, el espectador tendría que tomar una decisión que lo llevaría a otro video y a una nueva parte del recorrido.<br/>
                  El objetivo es colocar al usuario en los zapatos del personaje para una experiencia inmersiva.<br/>
                  El proyecto contaría con diferentes caminos y finales, haciendo que el público quiera repetir la experiencia, comparar decisiones y compartir sus resultados.<br/>
                  Además, YouTube nos permite trabajar sobre una plataforma ya conocida, accesible y fácil de compartir.
                </div>

                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee;"><b>explorador_314:</b> Otra vez a ver que final encuentro!!</div>
                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee;"><b>no_deberia_verlo:</b> Encontré un cuarto que seguro no ha encontrado nadie…</div>
                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee;"><b>perdido_en_el_pasillo:</b> Hay demasiados cuartos, cada vez que pongo este video me puedo perder por horas</div>
                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0; border-bottom: 1px dashed #eee;"><b>fan_anonima22:</b> Es increíble que algo tan profundo pueda hacerse en YouTube…</div>
                <div style="font-size: 19px; line-height: 1.6; color: #444; padding: 10px 0;"><b>jugador_302:</b> Siempre me siento demasiado en los zapatos del personaje… me asusta mucho cuando muero.</div>

                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #ccc; font-size: 19px; line-height: 1.6; color: #555;">
                  La idea de esto es que al final de cada video aparezca así:
                  <img src="${ejemploImg}" style="display: block; max-width: 100%; height: auto; margin-top: 6px; border: 1px solid #ccc;" alt="Ejemplo de pantalla final" />
                </div>
              </div>
            </div>

            <!-- Columna lateral: canal y relacionados -->
            <div style="width: 190px; flex-shrink: 0;">
              <div style="font-size: 10px; color: #555; margin-bottom: 6px;">From: <span style="color:#3388dd; font-weight:bold;">bloque314_archivo</span></div>
              <div style="font-size: 9px; color: #888; margin-bottom: 8px;">Joined: 7 months ago<br/>Videos: 25</div>

              <div style="font-weight: bold; font-size: 10px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 6px;">Related Videos</div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 9px; color: #444;">
                <div style="display: flex; gap: 6px; align-items: flex-start;">
                  <img src="${salonImg}" style="width: 48px; height: 36px; object-fit: cover; border: 1px solid #ccc; flex-shrink: 0;" alt="" />
                  <div>Grabación #04 — Turno nocturno<br/><span style="color:#888;">Views: 8,214</span></div>
                </div>
                <div style="display: flex; gap: 6px; align-items: flex-start;">
                  <img src="${telarañaImg}" style="width: 48px; height: 36px; object-fit: cover; border: 1px solid #ccc; flex-shrink: 0;" alt="" />
                  <div>Anomalía aula 314 (cámara fija)<br/><span style="color:#888;">Views: 5,662</span></div>
                </div>
                <div style="display: flex; gap: 6px; align-items: flex-start;">
                  <img src="${salonImg}" style="width: 48px; height: 36px; object-fit: cover; border: 1px solid #ccc; flex-shrink: 0;" alt="" />
                  <div>Foro: marcas en la pared — hilo cerrado<br/><span style="color:#888;">Views: 3,391</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `
  },
  firefox: {
    title: 'Firefox', icon: '🦊',
    body: `
      <div style="font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 11px; color: #cfd0e6; background: #0a0714; display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; user-select: none;">

        <!-- Barra de navegación del navegador -->
        <div class="browser-toolbar" style="margin: 0; background: #1c1428; border-bottom: 1px solid #3a2a55;">
          <div class="browser-btn">◀</div>
          <div class="browser-btn">▶</div>
          <div class="browser-btn">⟳</div>
          <div class="browser-address" style="background: #0f0a1a; color: #9a8fc0;">🔒 www.creepywiki.net/archivo_interno/bloque_314</div>
        </div>

        <!-- Masthead -->
        <div style="background: #000; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5a2e8c; flex-shrink: 0;">
          <div>
            <span style="font-weight: 900; font-size: 14px; letter-spacing: 0.5px; color: #b98bff; text-shadow: 0 0 6px rgba(185,139,255,0.5);">WWW.CREEPYWIKI.NET</span>
            <span style="color: #6a5a8a; font-size: 10px;"> / ARCHIVO_INTERNO / BLOQUE_314</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; background: #150f22; border: 1px solid #4a3a6a; border-radius: 2px; padding: 3px 6px;">
            <span style="color: #7a6a9a; font-size: 9px;">SEARCH FOR:</span>
            <input type="text" style="width: 70px; background: #0a0714; border: 1px solid #3a2a55; color: #cfc0f0; font-size: 10px; padding: 1px 3px;" />
          </div>
        </div>

        <!-- Navegación superior -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(180deg, #2a1a45 0%, #170f28 100%); padding: 5px 10px; border-bottom: 1px solid #5a2e8c; font-size: 10px; font-weight: bold; flex-shrink: 0; flex-wrap: wrap; gap: 4px;">
          <div style="display: flex; gap: 9px; color: #c9b8f0; flex-wrap: wrap;">
            <span style="cursor: pointer;">[ HOME ]</span>
            <span style="cursor: pointer;">[ DESCRIPCIÓN ]</span>
            <span style="cursor: pointer;">[ ANOMALÍAS ]</span>
            <span style="cursor: pointer;">[ EXPEDIENTES ]</span>
            <span style="cursor: pointer;">[ PROTOCOLOS ]</span>
            <span style="cursor: pointer; color: #ff5c7a;">[ CASO_FELIPE ]</span>
            <span style="cursor: pointer;">[ FORO ]</span>
            <span style="cursor: pointer;">[ BÚSQUEDA ]</span>
          </div>
          <div style="color: #6a5a8a; font-weight: normal; font-size: 9px;">VIERNES, 13 DE SEPTIEMBRE DE 2006</div>
        </div>

        <!-- Barra de sección -->
        <div style="background: #3a1030; color: #f0d8e8; font-weight: bold; padding: 4px 10px; font-size: 11px; letter-spacing: 0.05em; border-bottom: 1px solid #5a2e8c; flex-shrink: 0;">[ ARCHIVO PRINCIPAL ]</div>

        <!-- Cuerpo: 3 columnas — UN SOLO scroll para toda la fila (el div de
             afuera), y adentro un renglón flex normal (sin forzar
             align-items) con min-height:100%: así, si el contenido es corto
             las columnas igual llenan todo el alto sin dejar espacio vacío
             abajo, y si es largo, las tres columnas crecen parejo (la más
             alta define el alto de todas) en vez de quedar descuadradas. -->
        <div style="flex: 1; overflow-y: auto; overflow-x: hidden;">
        <div style="display: flex; min-height: 100%;">

          <!-- Columna izquierda: navegación -->
          <div style="width: 195px; background: #120b1f; border-right: 1px solid #3a2a55; padding: 10px 8px; flex-shrink: 0; font-size: 10px; line-height: 1.7;">

            <div style="color: #c9b8f0; font-weight: bold; letter-spacing: 0.04em; margin-bottom: 3px; border-bottom: 1px solid #2a1e40; padding-bottom: 2px;">Índice de Anomalías</div>
            <div style="padding-left: 8px; color: #a89bc4; margin-bottom: 10px;">
              <div>› Pasillos Infinitos (Nivel -2)</div>
              <div>› Escaleras sin retorno</div>
              <div>› Anomalías lumínicas en el aula 314</div>
            </div>

            <div style="color: #c9b8f0; font-weight: bold; letter-spacing: 0.04em; margin-bottom: 3px; border-bottom: 1px solid #2a1e40; padding-bottom: 2px;">Expedientes de Víctimas</div>
            <div style="padding-left: 8px; color: #a89bc4; margin-bottom: 10px;">
              <div>› Caso #04: Estudiante no identificado (Grabación de audio disponible)</div>
              <div>› Caso #09: Registro de cámaras de seguridad (Fragmento corrupto)</div>
              <div>› Desapariciones masivas del turno nocturno</div>
            </div>

            <div style="color: #c9b8f0; font-weight: bold; letter-spacing: 0.04em; margin-bottom: 3px; border-bottom: 1px solid #2a1e40; padding-bottom: 2px;">Protocolos de Contención</div>
            <div style="padding-left: 8px; color: #a89bc4; margin-bottom: 10px;">
              <div>› Qué hacer si escucha ruidos metálicos en los ductos</div>
              <div>› Reglas obligatorias para salir del edificio antes de medianoche</div>
              <div>› Advertencia sobre las luces de emergencia</div>
            </div>

            <div style="color: #ff5c7a; font-weight: bold; letter-spacing: 0.04em; margin-bottom: 3px; border-bottom: 1px solid #2a1e40; padding-bottom: 2px;">Caso Felipe (CLAVE REQUERIDA)</div>
            <div style="padding-left: 8px; color: #a89bc4;">
              <div>› Acceso al registro de investigación principal</div>
              <div>› Transmisión en directo interrumpida</div>
              <div>› Enlace al archivo del cortometraje principal</div>
            </div>
          </div>

          <!-- Columna central: contenido principal -->
          <div style="flex: 1; padding: 12px; background: #0d0918;">
            <div style="font-weight: bold; font-size: 13px; color: #c9b8f0; border-bottom: 1px solid #3a2a55; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.03em;">DESCRIPCIÓN DEL SISTEMA / CONCEPTO TRANSMEDIA</div>

            <p style="line-height: 1.55; color: #cfc8e0; font-weight: normal; margin: 0 0 10px;">El proyecto se despliega como una experiencia inmersiva previa al cortometraje y a la realidad virtual, utilizando una plataforma web con estética de archivo clasificado e intervenido.</p>

            <p style="line-height: 1.55; color: #cfc8e0; font-weight: normal; margin: 0 0 4px;">La propuesta sumerge a la audiencia en una investigación no lineal sobre las anomalías arquitectónicas y las desapariciones en el Bloque 314. A través de este entorno de falsa realidad, los usuarios fungen como investigadores que descifran expedientes y bitácoras corruptas, expandiendo el universo narrativo antes de confrontar la historia principal de Felipe.</p>

            <div style="background: #3a1030; color: #f0d8e8; font-weight: bold; padding: 4px 8px; font-size: 11px; margin: 16px 0 8px; letter-spacing: 0.05em;">[ ARCHIVOS RECIENTES ]</div>

            <div style="display: flex; flex-direction: column; gap: 9px;">
              <div style="border-bottom: 1px dashed #2a1e40; padding-bottom: 8px;">
                <span style="color: #e0d0ff; font-weight: bold;">Bitácora de Audio #88:</span>
                <span style="color: #a89bc4; font-weight: normal;"> "Juro que esa puerta no estaba ahí hace cinco minutos..."</span>
                <span style="color: #ff9dbb; font-weight: bold; cursor: pointer;"> [ESCUCHAR AUDIO]</span>
              </div>
              <div style="border-bottom: 1px dashed #2a1e40; padding-bottom: 8px;">
                <span style="color: #e0d0ff; font-weight: bold;">Reporte Psicológico:</span>
                <span style="color: #a89bc4; font-weight: normal;"> Paranoia colectiva y pérdida de noción temporal en el campus occidental.</span>
                <span style="color: #ff9dbb; font-weight: bold; cursor: pointer;"> [LEER REPORTE]</span>
              </div>
              <div>
                <span style="color: #e0d0ff; font-weight: bold;">Foro Estudiantil (Cercado):</span>
                <span style="color: #a89bc4; font-weight: normal;"> ¿Alguien más vio las marcas extrañas en las paredes del bloque viejo?</span>
                <span style="color: #ff9dbb; font-weight: bold; cursor: pointer;"> [VER HILO]</span>
              </div>
            </div>

            <div style="background: #3a1030; color: #f0d8e8; font-weight: bold; padding: 4px 8px; font-size: 11px; margin: 16px 0 8px; letter-spacing: 0.05em;">[ GALERÍA / EVIDENCIA FOTOGRÁFICA ]</div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 220px; border: 1px solid #3a2a55; border-radius: 3px; overflow: hidden; background: #150f22;">
                <img src="${telarañaImg}" style="display: block; max-width: 100%; height: auto;" alt="Telaraña en el techo del aula 314" />
                <div style="padding: 5px 6px; font-size: 9px; color: #a89bc4; line-height: 1.4;">
                  <span style="color: #e0d0ff; font-weight: bold;">IMG_0417.jpg</span> — subida por <span style="color:#ff9dbb;">usuario_anonimo_22</span><br/>
                  "Encontré esto en el techo del aula 314. No hay arañas así de grandes en la ciudad."
                </div>
              </div>
              <div style="flex: 1; min-width: 220px; border: 1px solid #3a2a55; border-radius: 3px; overflow: hidden; background: #150f22;">
                <img src="${salonImg}" style="display: block; max-width: 100%; height: auto;" alt="Salón vacío del bloque 314" />
                <div style="padding: 5px 6px; font-size: 9px; color: #a89bc4; line-height: 1.4;">
                  <span style="color: #e0d0ff; font-weight: bold;">IMG_0422.jpg</span> — subida por <span style="color:#ff9dbb;">vigilante_nocturno</span><br/>
                  "Así quedó el salón después del turno. Nadie más entró esa noche."
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: publicidad -->
          <div style="width: 158px; background: #0a0512; border-left: 1px solid #3a2a55; padding: 8px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px;">
            <div style="color: #6a5a8a; font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase;">/ publicidad / anuncio comunitario</div>

            <div style="background: linear-gradient(180deg, #4a1020 0%, #1a0810 100%); border: 1px solid #7a2035; border-radius: 3px; padding: 8px; text-align: center;">
              <div style="color: #ff8fa8; font-weight: bold; font-size: 11px; margin-bottom: 4px; letter-spacing: 0.04em;">¿NECESITAS AYUDA?</div>
              <div style="color: #d0aeb8; font-size: 9px; line-height: 1.45; font-weight: normal;">No confíes en los pasillos largos. Si escuchas pasos que te imitan, corre en dirección contraria. Esta wiki no se hace responsable por lo que ocurra después de las Campanadas de la noche.</div>
            </div>

            <div style="border: 1px solid #3a2a55; border-radius: 3px; overflow: hidden;">
              <img src="${moritaImg}" style="width: 100%; height: 70px; object-fit: cover; display: block;" alt="Anuncio" />
              <div style="background: #150f22; color: #b0a0d0; font-size: 8px; text-align: center; padding: 4px 3px; font-weight: bold; letter-spacing: 0.02em;">WIKI DE CREEPYPASTAS<br/>ARCHIVO COLABORATIVO</div>
            </div>

            <div style="border: 1px solid #3a2a55; border-radius: 3px; overflow: hidden;">
              <img src="${brunoImg}" style="width: 100%; height: 60px; object-fit: cover; display: block;" alt="Anuncio" />
              <div style="background: #150f22; color: #8a7ab0; font-size: 8px; text-align: center; padding: 3px; font-weight: normal;">Foro de apoyo para editores</div>
            </div>

            <div style="border: 1px solid #3a2a55; border-radius: 3px; overflow: hidden;">
              <img src="${gatovichImg}" style="width: 100%; height: 60px; object-fit: cover; display: block;" alt="Anuncio" />
              <div style="background: #150f22; color: #8a7ab0; font-size: 8px; text-align: center; padding: 3px; font-weight: normal;">Consejería psicológica 24/7</div>
            </div>
          </div>

        </div>
        </div>
      </div>
    `
  },
  files: {
    title: 'Explorador de archivos', icon: '🗂️',
    body: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #000; background: #f0f0f0; display: flex; flex-direction: column; width: 100%; height: 100%; border-radius: 0 0 6px 6px; overflow: hidden; box-sizing: border-box; user-select: none;">
        
        <!-- Ribbon Header -->
        <div style="display: flex; background: #e3e8f0; border-bottom: 1px solid #adadad; padding: 3px 6px; gap: 10px; align-items: center; flex-shrink: 0; font-size: 11px;">
          <span style="background: #2b579a; color: #fff; padding: 2px 10px; border-radius: 2px;">Archivo</span>
          <span style="background: #fff; border: 1px solid #b0b0b0; border-bottom: none; padding: 2px 12px; border-radius: 3px 3px 0 0;">Home</span>
          <span style="color: #333;">View</span>
        </div>

        <!-- Ribbon Toolbar Controls -->
        <div style="display: flex; align-items: center; background: #f5f6f7; border-bottom: 1px solid #adadad; padding: 6px 8px; gap: 15px; flex-shrink: 0;">
          <div style="display: flex; gap: 6px; align-items: center; border-right: 1px solid #d0d0d0; padding-right: 12px;">
            <div style="display: flex; flex-direction: column; align-items: center;"><span>📋</span><span style="font-size:9px;">Copy</span></div>
            <div style="display: flex; flex-direction: column; align-items: center;"><span>✂️</span><span style="font-size:9px;">Cut</span></div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; border-right: 1px solid #d0d0d0; padding-right: 12px;">
            <div style="display: flex; flex-direction: column; align-items: center;"><span>📁</span><span style="font-size:9px;">Copy to</span></div>
            <div style="display: flex; flex-direction: column; align-items: center;"><span>🗑️</span><span style="font-size:9px;">Delete</span></div>
            <div style="display: flex; flex-direction: column; align-items: center;"><span>✏️</span><span style="font-size:9px;">Rename</span></div>
          </div>
        </div>

        <!-- Address Bar -->
        <div style="display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: #fff; border-bottom: 1px solid #adadad; flex-shrink: 0;">
          <div style="display: flex; gap: 2px;">
            <button style="width: 22px; height: 22px; background: #f0f0f0; border: 1px solid #adadad; border-radius: 2px;">◀</button>
            <button style="width: 22px; height: 22px; background: #f0f0f0; border: 1px solid #adadad; border-radius: 2px;">▶</button>
          </div>
          <div style="flex: 1; display: flex; align-items: center; background: #fff; border: 1px solid #7f9db9; border-radius: 2px; padding: 2px 6px; gap: 4px; font-size: 11px; color: #000;">
            <span>💻</span> <span>Computer</span> <span>▶</span> <span>Disco local (C:)</span> <span>▶</span> <span>Usuarios</span> <span>▶</span> <span>Manu</span> <span>▶</span> <span>Escritorio</span>
          </div>
        </div>

        <!-- Main Workspace -->
        <div style="display: flex; flex: 1; overflow: hidden; background: #fff;">
          
          <!-- Sidebar -->
          <div style="width: 170px; background: #f8f9fa; border-right: 1px solid #dcdcdc; padding: 8px; overflow-y: auto; flex-shrink: 0; color: #000;">
            <div style="color: #d97706; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">⭐ Favoritos</div>
            <div style="padding-left: 14px; display: flex; flex-direction: column; gap: 6px; font-weight: normal; font-size: 10px; color: #333;">
              <div>📥 Descargas</div>
              <div>☁️ Dropbox</div>
              <div>💻 Escritorio</div>
              <div>⏱️ Sitios recientes</div>
            </div>
            <div style="margin-top: 12px; font-weight: bold; color: #000;">📚 Bibliotecas</div>
            <div style="padding-left: 14px; font-weight: normal; font-size: 10px; color: #333; margin-top: 4px;">
              <div>📄 Documentos</div>
              <div>🎵 Música</div>
              <div>🖼️ Imágenes</div>
            </div>
          </div>

          <!-- Files Area -->
          <div style="flex: 1; display: flex; flex-direction: column; background: #fff; overflow: auto; padding: 10px;">
            <div style="font-size: 14px; font-weight: bold; color: #2b579a; margin-bottom: 2px;">Bibliotecas</div>
            <div style="font-size: 10px; color: #666; margin-bottom: 10px;">Abra una biblioteca para ver sus archivos y organícelos por carpeta, fecha y otras propiedades.</div>
            
            <div style="display: flex; border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 10px; color: #555; font-weight: bold;">
              <span style="width: 180px;">Nombre ▴</span>
              <span style="width: 130px;">Fecha de modificación</span>
              <span style="width: 90px;">Tipo</span>
              <span>Tamaño</span>
            </div>

            <div style="display: flex; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">📄 Documentos</span>
              <span style="width: 130px; font-size: 10px; color: #666;">18/04/2026 12:00</span>
              <span style="width: 90px; font-size: 10px; color: #666;">Carpeta</span>
              <span style="font-size: 10px; color: #666;">--</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">🎵 Música</span>
              <span style="width: 130px; font-size: 10px; color: #666;">18/04/2026 12:01</span>
              <span style="width: 90px; font-size: 10px; color: #666;">Carpeta</span>
              <span style="font-size: 10px; color: #666;">--</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">🖼️ Imágenes</span>
              <span style="width: 130px; font-size: 10px; color: #666;">18/04/2026 12:02</span>
              <span style="width: 90px; font-size: 10px; color: #666;">Carpeta</span>
              <span style="font-size: 10px; color: #666;">--</span>
            </div>
          </div>

        </div>

      </div>
    `
  },
  player: {
    title: 'Windows Media Player', icon: '🎵',
    body: `
      <div class="player-root" style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #fff; background: linear-gradient(135deg, #4a6fa5 0%, #2b3a55 50%, #1e2638 100%); display: flex; width: 100%; height: 100%; border-radius: 0 0 6px 6px; overflow: hidden; box-sizing: border-box; user-select: none; border: 1px solid #7c93b6;">
        
        <!-- Left Sidebar Options -->
        <div style="width: 135px; background: rgba(30, 40, 60, 0.65); border-right: 1px solid rgba(255, 255, 255, 0.2); padding: 8px; display: flex; flex-direction: column; gap: 5px; flex-shrink: 0; font-size: 10px; backdrop-filter: blur(4px);">
          <div style="color: #ffd166; cursor: pointer; padding: 3px 5px; background: rgba(255,209,102,0.15); border-radius: 3px;">Now Playing</div>
          <div style="color: #e2e8f0; cursor: pointer; padding: 3px 5px;">Media Guide</div>
          <div style="color: #e2e8f0; cursor: pointer; padding: 3px 5px;">Copy from CD</div>
          <div style="color: #e2e8f0; cursor: pointer; padding: 3px 5px;">Media Library</div>
          <div style="color: #e2e8f0; cursor: pointer; padding: 3px 5px;">Radio Catalog</div>
          <div style="color: #e2e8f0; cursor: pointer; padding: 3px 5px;">Copy to CD / Device</div>
          <div style="color: #e2e8f0; cursor: pointer; padding: 3px 5px;">Skin Chooser</div>
        </div>

        <!-- Main Display & Controls Area -->
        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #0b0f19;">
          
          <!-- Top Song Header -->
          <div style="background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%); padding: 4px 10px; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.12); flex-shrink: 0; display: flex; justify-content: space-between;">
            <span><strong style="color: #38bdf8;">Gatovich</strong> <span style="color: #94a3b8; font-weight: normal;">— Like Humans Do</span></span>
            <span style="color: #f43f5e; font-size: 9px; background: rgba(244,63,94,0.15); padding: 1px 5px; border-radius: 2px;">LIVE VISUALS</span>
          </div>

          <!-- Central Visualizer Screen with Gatovich Image -->
          <div style="flex: 1; position: relative; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img src="${gatovichImg}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" alt="Gatovich" />
            <div style="position: absolute; bottom: 6px; left: 10px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 3px; font-size: 9px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15);">
              Presets: Particle Storm ✦
            </div>
          </div>

          <!-- Track Info Bar -->
          <div style="background: #111827; padding: 4px 10px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1f2937; font-size: 10px; flex-shrink: 0;">
            <span class="player-status-text" style="color: #4ade80;">▶ Playing: Gatovich - Like Humans Do</span>
            <span class="player-time-text" style="color: #94a3b8;">01:28 / 03:45</span>
          </div>

          <!-- Bottom Playback Controls Bar -->
          <div style="background: linear-gradient(180deg, #334155 0%, #1e293b 100%); padding: 6px 10px; display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,0.25); flex-shrink: 0;">
            <button class="player-btn-play" style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%); border: 1px solid #bae6fd; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">▶</button>
            <button class="player-btn-stop" style="width: 20px; height: 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 3px; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 9px;">⏹</button>
            <button class="player-btn-pause" style="width: 20px; height: 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 3px; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 9px;">⏸</button>
            <button style="width: 20px; height: 20px; background: transparent; border: none; color: #cbd5e1; cursor: pointer;">⏮</button>
            <button style="width: 20px; height: 20px; background: transparent; border: none; color: #cbd5e1; cursor: pointer;">⏭</button>
            
            <!-- Animated Progress Bar -->
            <div style="flex: 1; height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; position: relative; border: 1px solid rgba(255,255,255,0.2); overflow: hidden;">
              <div class="player-progress-fill" style="width: 40%; height: 100%; background: linear-gradient(90deg, #38bdf8 0%, #4ade80 100%); border-radius: 3px; transition: width 0.1s linear;"></div>
            </div>
            
            <span style="font-size: 9px; color: #cbd5e1;">🔊 ──●──</span>
          </div>

        </div>

      </div>
    `
  },
  paint: {
    title: 'Paint', icon: '🎨',
    body: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #000; background: #f0f0f0; display: flex; flex-direction: column; width: 100%; height: 100%; border-radius: 0 0 6px 6px; overflow: hidden; box-sizing: border-box; user-select: none;">
        
        <!-- Menu Bar -->
        <div style="display: flex; gap: 14px; padding: 5px 10px; border-bottom: 1px solid #dcdcdc; background: #f7f7f7; color: #000; font-weight: bold; flex-shrink: 0;">
          <span style="cursor:pointer;">File</span><span style="cursor:pointer;">Edit</span><span style="cursor:pointer;">View</span><span style="cursor:pointer;">Image</span><span style="cursor:pointer;">Colors</span><span style="cursor:pointer;">Help</span>
        </div>
        
        <!-- Main Workspace -->
        <div style="display: flex; flex: 1; overflow: hidden; padding: 6px; gap: 6px; background: #f0f0f0;">
          
          <!-- Left Tool Box (Vista Style) -->
          <div style="width: 62px; background: #e4e4e4; display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; align-content: start; padding: 4px; border: 1px solid #adadad; border-radius: 3px; flex-shrink: 0;">
            <button class="paint-tool" data-tool="select" title="Selección libre" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:12px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">✨</button>
            <button class="paint-tool" data-tool="box-select" title="Selección rectangular" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:12px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">🔲</button>
            <button class="paint-tool" data-tool="eraser" title="Borrador" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">▧</button>
            <button class="paint-tool" data-tool="fill" title="Bote de pintura (Cubeta)" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">🪣</button>
            <button class="paint-tool" data-tool="picker" title="Gotero" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">💧</button>
            <button class="paint-tool" data-tool="zoom" title="Lupa" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">🔍</button>
            <button class="paint-tool active" data-tool="pencil" title="Lápiz" style="width:26px;height:26px;background:#d0e3fc;border:2px solid #3b82f6;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">✏️</button>
            <button class="paint-tool" data-tool="brush" title="Pincel" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">🖌️</button>
            <button class="paint-tool" data-tool="airbrush" title="Aerógrafo" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">💨</button>
            <button class="paint-tool" data-tool="text" title="Texto" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">A</button>
            <button class="paint-tool" data-tool="line" title="Línea" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">╱</button>
            <button class="paint-tool" data-tool="curve" title="Curva" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">〰️</button>
            <button class="paint-tool" data-tool="rect" title="Rectángulo" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">◻️</button>
            <button class="paint-tool" data-tool="polygon" title="Polígono" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">📐</button>
            <button class="paint-tool" data-tool="ellipse" title="Elipse" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">◯</button>
            <button class="paint-tool" data-tool="rounded" title="Redondo" style="width:26px;height:26px;background:#fafafa;border:1px solid #999;cursor:pointer;font-size:13px;font-weight:bold;color:#000;display:flex;align-items:center;justify-content:center;">⬭</button>
          </div>

          <!-- Canvas Container -->
          <div style="flex: 1; background: #dfdfdf; border: 1px solid #adadad; border-radius: 3px; position: relative; overflow: auto; display: flex; align-items: flex-start; justify-content: flex-start;">
            <canvas class="paint-canvas" width="550" height="380" style="background: #fff; cursor: crosshair; display: block;"></canvas>
          </div>

        </div>

        <!-- Color Palette Bottom Bar -->
        <div style="display: flex; align-items: center; background: #f0f0f0; padding: 6px 8px; border-top: 1px solid #dcdcdc; gap: 10px; flex-shrink: 0;">
          <input type="color" id="paint-color" value="#000000" style="border:1px solid #adadad; border-radius:2px; width:28px; height:28px; cursor:pointer; background:#fff; padding:1px;" title="Color actual">
          <button id="paint-clear" style="padding:4px 12px; font-size:11px; font-weight:bold; color:#000; cursor:pointer; background:linear-gradient(180deg, #fafafa 0%, #e1e1e1 100%); border:1px solid #adadad; border-radius:3px;">Limpiar</button>
          <div style="display: flex; flex-wrap: wrap; gap: 2px; max-width: 340px;">
            <div class="swatch" data-color="#000000" style="width:16px;height:16px;background:#000;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#ffffff" style="width:16px;height:16px;background:#fff;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#808080" style="width:16px;height:16px;background:#808080;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#c0c0c0" style="width:16px;height:16px;background:#c0c0c0;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#800000" style="width:16px;height:16px;background:#800000;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#ff0000" style="width:16px;height:16px;background:#f00;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#808000" style="width:16px;height:16px;background:#808000;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#ffff00" style="width:16px;height:16px;background:#ff0;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#008000" style="width:16px;height:16px;background:#008000;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#00ff00" style="width:16px;height:16px;background:#0f0;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#008080" style="width:16px;height:16px;background:#008080;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#00ffff" style="width:16px;height:16px;background:#0ff;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#000080" style="width:16px;height:16px;background:#000080;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#0000ff" style="width:16px;height:16px;background:#00f;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#800080" style="width:16px;height:16px;background:#800080;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
            <div class="swatch" data-color="#ff00ff" style="width:16px;height:16px;background:#f0f;cursor:pointer;border:1px solid #777;border-radius:1px;"></div>
          </div>
        </div>

        <!-- Status Bar -->
        <div style="background: #f0f0f0; border-top: 1px solid #dcdcdc; padding: 4px 8px; font-size: 11px; font-weight: bold; color: #333; flex-shrink: 0;">
          For Help, click Help Topics on the Help Menu.
        </div>

      </div>
    `
  },
  gmail: {
    title: 'Mail', icon: '✉️',
    body: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #000; background: #f0f0f0; display: flex; flex-direction: column; width: 100%; height: 100%; border-radius: 0 0 4px 4px; overflow: hidden; box-sizing: border-box;">
        
        <!-- Menu Bar -->
        <div style="display: flex; gap: 12px; padding: 4px 8px; border-bottom: 1px solid #ccc; background: #fff; color: #000; font-weight: bold; flex-shrink: 0;">
          <span style="cursor:pointer;">File</span><span style="cursor:pointer;">Edit</span><span style="cursor:pointer;">View</span><span style="cursor:pointer;">Tools</span><span style="cursor:pointer;">Message</span><span style="cursor:pointer;">Help</span>
        </div>
        
        <!-- Toolbar -->
        <div style="display: flex; gap: 18px; padding: 6px 10px; border-bottom: 1px solid #a0a0a0; background: linear-gradient(180deg, #f2f7ff 0%, #d9e6fa 100%); align-items: center; flex-shrink: 0;">
          <span style="font-weight:bold; color:#000; cursor:pointer;">✉️ Create Mail</span>
          <span style="font-weight:bold; color:#000; cursor:pointer;">↩️ Reply</span>
          <span style="font-weight:bold; color:#000; cursor:pointer;">↪️ Forward</span>
          <span style="font-weight:bold; margin-left: auto; color:#000; cursor:pointer;">📥 Send/Receive</span>
        </div>
        
        <div style="display: flex; flex: 1; overflow: hidden;">
          <!-- Sidebar (Local Folders) -->
          <div style="width: 180px; background: #fff; border-right: 1px solid #a0a0a0; padding: 6px; overflow-y: auto; flex-shrink: 0;">
            <div style="font-weight: bold; margin-bottom: 6px; color: #000;">📂 Local Folders</div>
            <div style="padding: 4px 0 4px 16px; background: #d9e8fa; border: 1px solid #a4c8f0; border-radius: 3px; color: #000; font-weight: bold; margin-bottom: 2px;">📥 Inbox</div>
            <div style="padding: 4px 0 4px 16px; color: #000; font-weight: bold; cursor:pointer;">📤 Outbox</div>
            <div style="padding: 4px 0 4px 16px; color: #000; font-weight: bold; cursor:pointer;">📁 Sent Items</div>
            <div style="padding: 4px 0 4px 16px; color: #000; font-weight: bold; cursor:pointer;">🗑️ Deleted Items</div>
            <div style="padding: 4px 0 4px 16px; color: #000; font-weight: bold; cursor:pointer;">📝 Drafts</div>
            <div style="padding: 4px 0 4px 16px; color: #000; font-weight: bold; cursor:pointer;">🚫 Junk E-mail</div>
          </div>
          
          <!-- Main Content Area -->
          <div style="flex: 1; display: flex; flex-direction: column; background: #fff; overflow: hidden;">
            
            <!-- Message List -->
            <div style="height: 80px; border-bottom: 1px solid #a0a0a0; overflow-y: auto; background: #fff; flex-shrink: 0;">
              <div style="display: flex; border-bottom: 1px solid #e0e0e0; padding: 3px 6px; background: #f1f1f1; font-weight: bold; font-size: 10px; color: #000;">
                <span style="width: 20px;">!</span>
                <span style="width: 20px;">📎</span>
                <span style="width: 160px;">From</span>
                <span style="flex: 1;">Subject</span>
              </div>
              <!-- Active Email Row -->
              <div style="display: flex; border-bottom: 1px solid #e0e0e0; padding: 4px 6px; background: #d9e8fa; align-items: center; cursor: pointer;">
                <span style="width: 20px;"></span>
                <span style="width: 20px;">✉️</span>
                <span style="width: 160px; color: #000; font-weight: bold;">qklolwow</span>
                <span style="flex: 1; color: #000; font-weight: bold;">poso 💋</span>
              </div>
            </div>
            
            <!-- Message Preview Pane -->
            <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
              <div style="background: #f1f1f1; padding: 8px; border-bottom: 1px solid #d0d0d0; font-size: 11px; font-weight: bold; color: #000; flex-shrink: 0;">
                <div style="margin-bottom: 4px;"><strong>From:</strong> qklolwow &lt;qklolwow@hotmail.com&gt;</div>
                <div><strong>Subject:</strong> poso 💋</div>
              </div>
              <div style="padding: 12px; flex: 1; overflow-y: auto; background: #fff; display: flex; gap: 20px; align-items: flex-start;">
                <div>
                  <p style="margin-top: 0; margin-bottom: 8px; font-size: 13px; font-weight: bold; color: #000;">poso 💋</p>
                  <img src="${moritaImg}" style="max-width: 260px; height: auto; border-radius: 4px; border: 1px solid #ddd; box-shadow: 0 2px 6px rgba(0,0,0,0.15);" alt="Morita" />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `
  },
  gallery: {
    title: 'Bruno - Photo Gallery', icon: '🖼️',
    body: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #000; background: #f0f0f0; display: flex; flex-direction: column; width: 100%; height: 100%; border-radius: 0 0 6px 6px; overflow: hidden; box-sizing: border-box; user-select: none;">
        
        <!-- Top Toolbar (Photo Gallery Style) -->
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: linear-gradient(180deg, #f7f7f7 0%, #e2e2e2 100%); border-bottom: 1px solid #adadad; flex-shrink: 0; font-size: 10px; color: #000;">
          <button style="background: #fff; border: 1px solid #999; border-radius: 3px; padding: 3px 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 4px; color: #000;">⬅ Back to Gallery</button>
          <div style="width: 1px; height: 16px; background: #ccc; margin: 0 4px;"></div>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">📁 File ▾</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">✨ Fix</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">ℹ️ Info</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">🖨️ Print</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">✉️ E-mail</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">💿 Burn</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; color: #000;">🎬 Make a Movie</button>
          <button style="background: transparent; border: 1px solid transparent; border-radius: 2px; padding: 3px 6px; cursor: pointer; margin-left: auto; color: #000;">🔍 Open</button>
        </div>

        <!-- Main Viewer Workspace -->
        <div style="display: flex; flex: 1; overflow: hidden; background: #dfdfdf;">
          
          <!-- Central Image Canvas Area -->
          <div style="flex: 1; background: #525252; border: 2px inset #fff; display: flex; align-items: center; justify-content: center; position: relative; overflow: auto; padding: 12px;">
            <img src="${brunoImg}" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 4px 16px rgba(0,0,0,0.5); border: 2px solid #fff;" alt="Bruno" />
          </div>

          <!-- Right Properties Panel (Fondo blanco y letras negras) -->
          <div style="width: 210px; background: #ffffff; border-left: 1px solid #adadad; padding: 10px; display: flex; flex-direction: column; gap: 10px; font-size: 11px; overflow-y: auto; flex-shrink: 0; color: #000000;">
            <div style="text-align: center;">
              <img src="${brunoImg}" style="width: 80px; height: 60px; object-fit: cover; border: 1px solid #adadad; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" alt="Thumbnail" />
            </div>
            <div style="font-weight: bold; color: #0055ea; font-size: 11px; text-align: center; cursor: pointer;">Bruno.jpg</div>
            <div style="font-size: 10px; color: #333333; text-align: center;">18.04.2026  14:32<br>412 KB (1024 x 768)</div>
            
            <!-- Star Ratings -->
            <div style="text-align: center; color: #eab308; font-size: 13px; letter-spacing: 2px;">
              ★★★★★
            </div>

            <hr style="border: none; border-top: 1px solid #ccc; margin: 4px 0;" />

            <div style="font-weight: bold; color: #000000; display: flex; align-items: center; gap: 4px;">🏷️ Add Tags</div>
            <div style="font-size: 10px; color: #000000; padding-left: 4px; display: flex; flex-direction: column; gap: 4px; font-weight: normal;">
              <div>🐾 Bruno</div>
              <div>✨ Mascotas</div>
            </div>
          </div>

        </div>

        <!-- Bottom Status Bar -->
        <div style="background: #f0f0f0; border-top: 1px solid #dcdcdc; padding: 4px 8px; font-size: 11px; font-weight: bold; color: #000000; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
          <span>Bruno 🐾</span>
          <span style="font-weight: normal; color: #333333;">Item 1 of 1</span>
        </div>

      </div>
    `
  },
  messenger: {
    title: 'Messenger', icon: '💬',
    body: `
      <div style="font-family:Tahoma,sans-serif; font-size:11px; font-weight: bold; color:#000; background:rgba(200,220,240,0.95); padding:6px; border-radius:4px;">
        <div style="display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid #777; margin-bottom:6px;">
          <div style="width:32px; height:32px; background:#1f6fd6; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">🐱</div>
          <div>
            <div style="font-weight:bold; font-size:12px; color:#000;">Tomy :3</div>
            <div style="font-size:10px; color:#005500; font-weight:bold;">🟢 Disponible para hablar</div>
          </div>
        </div>
        
        <div style="font-size:10px; text-transform:uppercase; font-weight:bold; color:#000; margin-bottom:4px; letter-spacing:0.05em;">Amigos Conectados</div>

        <div style="display:flex; flex-direction:column; gap:4px; max-height:190px; overflow-y:auto; padding-right:2px;">
          
          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">⭐</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">lady gaga</div><div style="font-size:9px; color:#444; font-weight:bold;">bad_romance_92 · En línea</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">🐾</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">brunaenae</div><div style="font-size:9px; color:#444; font-weight:bold;">bruna_bae · En línea</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">🐶</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">bru</div><div style="font-size:9px; color:#444; font-weight:bold;">bru_master · Escuchando música</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#d93a3a; border-radius:50%;"></div>
            <span style="font-size:14px;">🏝️</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">J. Epstein</div><div style="font-size:9px; color:#444; font-weight:bold;">private_island · Ausente</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">🐻</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">Kanye west</div><div style="font-size:9px; color:#444; font-weight:bold;">ye_yeezy · Escuchando Donda</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#2fa32f; border-radius:50%;"></div>
            <span style="font-size:14px;">⚡</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">Skrillex</div><div style="font-size:9px; color:#444; font-weight:bold;">dubstep_god · En línea</div></div>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:#fff; padding:4px 6px; border-radius:4px; border:1px solid #bbb;">
            <div style="width:8px; height:8px; background:#e5a900; border-radius:50%;"></div>
            <span style="font-size:14px;">⛏️</span>
            <div style="flex:1;"><div style="font-weight:bold; color:#000;">El minero</div><div style="font-size:9px; color:#444; font-weight:bold;">diamond_hunter · Ocupado minando</div></div>
          </div>

        </div>

        <div style="margin-top:6px; display:flex; gap:4px;">
          <input type="text" placeholder="Escribe un estado..." style="flex:1; background:#fff; border:1px solid #777; border-radius:3px; padding:3px 6px; font-size:10px; font-weight:bold; color:#000;" />
        </div>
      </div>
    `
  },
  trash: {
    title: 'Papelera', icon: '🗑️',
    body: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #000; background: #f0f0f0; display: flex; flex-direction: column; width: 100%; height: 100%; border-radius: 0 0 6px 6px; overflow: hidden; box-sizing: border-box; user-select: none;">
        
        <!-- Top Toolbar -->
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: linear-gradient(180deg, #f7f7f7 0%, #e2e2e2 100%); border-bottom: 1px solid #adadad; flex-shrink: 0; font-size: 11px;">
          <button style="background: #fff; border: 1px solid #999; border-radius: 3px; padding: 3px 8px; font-weight: bold;">Organizar ▾</button>
          <button style="background: #fff; border: 1px solid #999; border-radius: 3px; padding: 3px 8px; font-weight: bold;">Vistas ▾</button>
          <div style="width: 1px; height: 16px; background: #ccc; margin: 0 4px;"></div>
          <button style="background: #fff; border: 1px solid #999; border-radius: 3px; padding: 3px 8px; font-weight: bold;">🗑️ Vaciar la Papelera de reciclaje</button>
          <button style="background: #fff; border: 1px solid #999; border-radius: 3px; padding: 3px 8px; font-weight: bold;">♻️ Restaurar este elemento</button>
        </div>

        <!-- Address Bar -->
        <div style="display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: #fff; border-bottom: 1px solid #adadad; flex-shrink: 0;">
          <div style="display: flex; gap: 2px;">
            <button style="width: 22px; height: 22px; background: #f0f0f0; border: 1px solid #adadad; border-radius: 2px;">◀</button>
            <button style="width: 22px; height: 22px; background: #f0f0f0; border: 1px solid #adadad; border-radius: 2px;">▶</button>
          </div>
          <div style="flex: 1; display: flex; align-items: center; background: #fff; border: 1px solid #7f9db9; border-radius: 2px; padding: 2px 6px; gap: 4px; font-size: 11px; color: #000;">
            <span>🗑️</span> <span>Papelera de reciclaje</span>
          </div>
          <div style="background: #fff; border: 1px solid #7f9db9; border-radius: 2px; padding: 2px 6px; width: 140px; color: #777; font-size: 11px;">
            🔍 Buscar
          </div>
        </div>

        <!-- Main Workspace (Sidebar + Trash List) -->
        <div style="display: flex; flex: 1; overflow: hidden; background: #fff;">
          
          <!-- Left Sidebar -->
          <div style="width: 180px; background: #f8f9fa; border-right: 1px solid #dcdcdc; padding: 8px; overflow-y: auto; flex-shrink: 0; color: #000;">
            <div style="color: #0055ea; font-weight: bold; margin-bottom: 6px;">Vínculos favoritos</div>
            <div style="padding-left: 10px; display: flex; flex-direction: column; gap: 4px; font-size: 10px; color: #0055ea;">
              <div>📁 aulaClic</div>
              <div>📄 Documentos</div>
              <div>🖼️ Imágenes</div>
              <div style="color: #000;">Más »</div>
            </div>
            
            <div style="margin-top: 14px; font-weight: bold; color: #000;">Carpetas</div>
            <div style="padding-left: 10px; font-size: 10px; color: #333; margin-top: 4px; display: flex; flex-direction: column; gap: 3px;">
              <div>💻 Escritorio</div>
              <div style="padding-left: 12px;">🐾 Bruno</div>
              <div style="padding-left: 12px;">👥 Acceso público</div>
              <div>🖥️ Equipo</div>
              <div>🌐 Red</div>
              <div>⚙️ Panel de control</div>
              <div style="font-weight: bold; color: #000;">🗑️ Papelera de reciclaje</div>
            </div>
          </div>

          <!-- Trash Contents List -->
          <div style="flex: 1; display: flex; flex-direction: column; background: #fff; overflow: auto;">
            <div style="display: flex; border-bottom: 1px solid #ccc; padding: 4px 8px; font-size: 10px; color: #555; font-weight: bold; background: #f8f9fa;">
              <span style="width: 180px;">Nombre</span>
              <span style="flex: 1;">Ubicación original</span>
            </div>

            <div style="display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">🌐 Ejercicio G1.htm</span>
              <span style="flex: 1; font-size: 10px; color: #444;">C:\\Users\\Bruno\\aulaClic</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">📁 Ejercicio G1_archivos</span>
              <span style="flex: 1; font-size: 10px; color: #444;">C:\\Users\\Bruno\\aulaClic</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">📊 Ejercicio12.pptx</span>
              <span style="flex: 1; font-size: 10px; color: #444;">C:\\Users\\Bruno\\aulaClic</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">📦 epp04_explorador.rar</span>
              <span style="flex: 1; font-size: 10px; color: #444;">C:\\Users\\Bruno\\aulaClic</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #f0f0f0; font-weight: normal; font-size: 11px; color: #000; background: #d9e8fa;">
              <span style="width: 180px; display: flex; align-items: center; gap: 6px;">📄 primer.txt</span>
              <span style="flex: 1; font-size: 10px; color: #444;">C:\\Users\\Bruno\\aulaClic</span>
            </div>
          </div>

        </div>

        <!-- Bottom Details Pane -->
        <div style="background: #f4f4f4; border-top: 1px solid #adadad; padding: 6px 10px; display: flex; gap: 15px; align-items: center; font-size: 10px; color: #333; flex-shrink: 0;">
          <div style="font-size: 24px;">📄</div>
          <div>
            <div style="font-weight: bold; color: #000;">C:\\Users\\Bruno\\aulaClic\\primer.txt</div>
            <div>Documento de texto &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Tamaño: 25 bytes</div>
            <div>Fecha de creación: 17/08/2007 0:50 &nbsp;&nbsp;&nbsp;&nbsp; Fecha modificación: 17/08/2007 0:50</div>
          </div>
        </div>

      </div>
    `
  },

  powerpoint: {
    title: 'PowerPoint', icon: '📊',
    body: POWERPOINT_BODY
  }
};

const WINDOW_Z_MIN = 5;
const WINDOW_Z_MAX = 14;
const LAB_Z = 500;
let zTop = WINDOW_Z_MIN;

function bringToFront(el) {
  if (el.classList.contains('is-lab')) {
    el.style.zIndex = String(LAB_Z);
    return;
  }
  zTop = zTop >= WINDOW_Z_MAX ? WINDOW_Z_MIN : zTop + 1;
  el.style.zIndex = String(zTop);
}

function initPlayerUI(container) {
  const playBtn = container.querySelector('.player-btn-play');
  const pauseBtn = container.querySelector('.player-btn-pause');
  const stopBtn = container.querySelector('.player-btn-stop');
  const fillBar = container.querySelector('.player-progress-fill');
  const statusText = container.querySelector('.player-status-text');
  const timeText = container.querySelector('.player-time-text');
  if (!playBtn || !fillBar) return;

  let progress = 45;
  let isPlaying = true;

  const interval = setInterval(() => {
    if (!isPlaying) return;
    progress = (progress + 0.3) % 100;
    fillBar.style.width = `${progress}%`;
    
    const currentSecs = Math.floor((progress / 100) * 225);
    const mins = String(Math.floor(currentSecs / 60)).padStart(2, '0');
    const secs = String(currentSecs % 60).padStart(2, '0');
    if (timeText) {
      timeText.textContent = `${mins}:${secs} / 03:45`;
    }
  }, 200);

  playBtn.addEventListener('click', () => {
    isPlaying = true;
    if (statusText) statusText.textContent = '▶ Playing: Gatovich - Like Humans Do';
  });

  pauseBtn.addEventListener('click', () => {
    isPlaying = false;
    if (statusText) statusText.textContent = '⏸ Paused: Gatovich - Like Humans Do';
  });

  stopBtn.addEventListener('click', () => {
    isPlaying = false;
    progress = 0;
    fillBar.style.width = '0%';
    if (timeText) timeText.textContent = '00:00 / 03:45';
    if (statusText) statusText.textContent = '⏹ Stopped';
  });

  const observer = new MutationObserver((mutations, obs) => {
    if (!document.body.contains(container)) {
      clearInterval(interval);
      obs.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function initYoutubeVideo(container) {
  const video = container.querySelector('.yt-video');
  const backBtn = container.querySelector('.yt-back');
  const fwdBtn = container.querySelector('.yt-fwd');
  const muteBtn = container.querySelector('.yt-mute');
  if (!video) return;

  backBtn?.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
  });

  fwdBtn?.addEventListener('click', () => {
    const max = isFinite(video.duration) ? video.duration : video.currentTime + 10;
    video.currentTime = Math.min(max, video.currentTime + 10);
  });

  muteBtn?.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔇 Activar sonido' : '🔊 Silenciar';
  });
}

function initPaintCanvas(container) {
  const canvas = container.querySelector('.paint-canvas');
  const colorPicker = container.querySelector('#paint-color');
  const clearBtn = container.querySelector('#paint-clear');
  const swatches = container.querySelectorAll('.swatch');
  const toolButtons = container.querySelectorAll('.paint-tool');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let drawing = false;
  let currentTool = 'pencil';
  let startX = 0, startY = 0;
  let snapshot = null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toolButtons.forEach(b => {
        b.style.background = '#fafafa';
        b.style.border = '1px solid #999';
      });
      btn.style.background = '#d0e3fc';
      btn.style.border = '2px solid #3b82f6';
      currentTool = btn.getAttribute('data-tool');
    });
  });

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const c = swatch.getAttribute('data-color');
      colorPicker.value = c;
    });
  });

  function hexToRgba(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return [num >> 16, (num >> 8) & 255, num & 255, 255];
  }

  function floodFill(startX, startY, fillColorHex) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const targetIdx = (startY * canvas.width + startX) * 4;
    const targetR = pixels[targetIdx];
    const targetG = pixels[targetIdx + 1];
    const targetB = pixels[targetIdx + 2];
    const targetA = pixels[targetIdx + 3];

    const [fillR, fillG, fillB, fillA] = hexToRgba(fillColorHex);

    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) return;

    const queue = [[startX, startY]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const idx = y * canvas.width + x;

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      if (visited[idx]) continue;

      const pIdx = idx * 4;
      const r = pixels[pIdx];
      const g = pixels[pIdx + 1];
      const b = pixels[pIdx + 2];
      const a = pixels[pIdx + 3];

      if (r === targetR && g === targetG && b === targetB && a === targetA) {
        pixels[pIdx] = fillR;
        pixels[pIdx + 1] = fillG;
        pixels[pIdx + 2] = fillB;
        pixels[pIdx + 3] = fillA;
        visited[idx] = 1;

        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = Math.floor(e.clientX - rect.left);
    startY = Math.floor(e.clientY - rect.top);
    drawing = true;

    const activeColor = colorPicker.value;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    } else if (currentTool === 'fill') {
      floodFill(startX, startY, activeColor);
      drawing = false;
    } else if (currentTool === 'rect' || currentTool === 'ellipse') {
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (currentTool === 'picker') {
      const p = ctx.getImageData(startX, startY, 1, 1).data;
      const hex = '#' + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1);
      colorPicker.value = hex;
      drawing = false;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const activeColor = colorPicker.value;

    if (currentTool === 'pencil') {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 1;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'brush') {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.lineCap = 'square';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'rect') {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentTool === 'ellipse') {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      const radiusX = Math.abs(x - startX) / 2;
      const radiusY = Math.abs(y - startY) / 2;
      const centerX = startX + (x - startX) / 2;
      const centerY = startY + (y - startY) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  window.addEventListener('mouseup', () => {
    if (drawing) {
      drawing = false;
    }
  });

  clearBtn.addEventListener('click', () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
}

export function createLabPanel() {
  const openWindows = new Map();
  let windowCounter = 0;

  // Taskbar container for open windows
  const taskbarAppsContainer = document.createElement('div');
  taskbarAppsContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    flex: 1;
    overflow-x: auto;
    height: 100%;
  `;

  function makeDraggable(el, handle) {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    handle.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.classList.contains('close-btn') || e.target.classList.contains('min-btn')) return;
      if (el.dataset.maximized === 'true') return;
      dragging = true;
      bringToFront(el);
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    });

    window.addEventListener('pointerup', () => { dragging = false; });
  }

  function makeResizableFull(el) {
    const handles = [
      { dir: 'right', style: 'right: 0; top: 0; width: 6px; height: 100%; cursor: ew-resize;' },
      { dir: 'left', style: 'left: 0; top: 0; width: 6px; height: 100%; cursor: ew-resize;' },
      { dir: 'bottom', style: 'left: 0; bottom: 0; width: 100%; height: 6px; cursor: ns-resize;' },
      { dir: 'top', style: 'left: 0; top: 0; width: 100%; height: 6px; cursor: ns-resize;' },
      { dir: 'se', style: 'right: 0; bottom: 0; width: 12px; height: 12px; cursor: nwse-resize; z-index: 11;' },
      { dir: 'sw', style: 'left: 0; bottom: 0; width: 12px; height: 12px; cursor: nesw-resize; z-index: 11;' },
      { dir: 'ne', style: 'right: 0; top: 0; width: 12px; height: 12px; cursor: nesw-resize; z-index: 11;' },
      { dir: 'nw', style: 'left: 0; top: 0; width: 12px; height: 12px; cursor: nwse-resize; z-index: 11;' }
    ];

    handles.forEach(h => {
      const div = document.createElement('div');
      div.style.cssText = `position: absolute; ${h.style};`;
      el.appendChild(div);

      let resizing = null;
      let startX, startY, startW, startH, startLeft, startTop;

      div.addEventListener('pointerdown', (e) => {
        if (el.dataset.maximized === 'true') return;
        resizing = h.dir;
        bringToFront(el);
        startX = e.clientX;
        startY = e.clientY;
        startW = el.offsetWidth;
        startH = el.offsetHeight;
        startLeft = el.offsetLeft;
        startTop = el.offsetTop;
        e.stopPropagation();
        e.preventDefault();
      });

      window.addEventListener('pointermove', (e) => {
        if (resizing !== h.dir) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newW = startW;
        let newH = startH;
        let newL = startLeft;
        let newT = startTop;

        if (resizing.includes('right')) newW = Math.max(280, startW + dx);
        if (resizing.includes('left')) {
          newW = Math.max(280, startW - dx);
          if (newW > 280) newL = startLeft + dx;
        }
        if (resizing.includes('bottom')) newH = Math.max(200, startH + dy);
        if (resizing.includes('top')) {
          newH = Math.max(200, startH - dy);
          if (newH > 200) newT = startTop + dy;
        }

        el.style.width = `${newW}px`;
        el.style.height = `${newH}px`;
        el.style.left = `${newL}px`;
        el.style.top = `${newT}px`;
      });

      window.addEventListener('pointerup', () => {
        if (resizing === h.dir) resizing = null;
      });
    });
  }

  function openWindow(type, { title, bodyEl, isLab = false, startButtonEl = null } = {}) {
    const def = WINDOW_DEFS[type] || { title: title || 'Ventana', icon: '🪟' };
    const id = `win-${type}-${windowCounter++}`;

    const el = document.createElement('div');
    el.className = isLab ? 'desktop-window is-lab start-menu-window' : 'desktop-window';
    el.style.position = 'fixed';
    el.style.transformOrigin = 'bottom center';
    el.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease';

    // Start Menu entry animation from the start button (bottom-left corner).
    // Se ancla con `bottom` al alto real de la barra de tareas para que
    // quede SIEMPRE pegado a ella, como el menú Start de Windows —
    // ya no depende de restar un offset fijo a innerHeight.
    if (isLab && startButtonEl) {
      const btnRect = startButtonEl.getBoundingClientRect();
      const targetW = 410;
      const taskbarH = (bar && bar.offsetHeight) || 30;
      const targetH = Math.min(480, window.innerHeight - taskbarH - 10);
      const targetLeft = btnRect.left;

      el.style.left = `${btnRect.left}px`;
      el.style.top = 'auto';
      el.style.bottom = `${taskbarH}px`;
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.1)';
      el.style.transformOrigin = 'bottom left';

      setTimeout(() => {
        el.style.left = `${Math.max(10, targetLeft)}px`;
        el.style.bottom = `${taskbarH}px`;
        el.style.width = `${targetW}px`;
        el.style.height = `${targetH}px`;
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      }, 10);
    } else {
      el.style.left = `${100 + Math.random() * 100}px`;
      el.style.top = `${80 + Math.random() * 80}px`;
      if (type === 'files' || type === 'trash') {
        el.style.width = '780px';
        el.style.height = '520px';
      } else if (type === 'youtube') {
        el.style.width = '700px';
        el.style.height = '540px';
      } else if (type === 'firefox') {
        el.style.width = '840px';
        el.style.height = '560px';
      } else if (type === 'player') {
        el.style.width = '640px';
        el.style.height = '420px';
      } else if (type === 'gallery') {
        el.style.width = '740px';
        el.style.height = '480px';
      } else if (type === 'gmail') {
        el.style.width = '780px';
        el.style.height = '420px';
      } else if (type === 'paint') {
        el.style.width = '640px';
        el.style.height = '480px';
      } else if (type === 'powerpoint') {
        el.style.width = `${Math.min(1080, window.innerWidth - 60)}px`;
        el.style.height = `${Math.min(700, window.innerHeight - 80)}px`;
        el.style.left = '30px';
        el.style.top = '20px';
      } else {
        el.style.width = '320px';
        el.style.height = '280px';
      }
    }

    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.innerHTML = `<span>${def.icon || ''} ${title || def.title}</span>`;

    // Window Control Buttons Container (Minimize & Close)
    const windowBtnsWrap = document.createElement('div');
    windowBtnsWrap.style.cssText = 'display: flex; gap: 3px; align-items: center;';

    const minBtn = document.createElement('button');
    minBtn.className = 'min-btn';
    minBtn.textContent = '🗕';
    minBtn.title = 'Minimizar';
    minBtn.style.cssText = `
      background: linear-gradient(180deg, #f0f0f0 0%, #d4d4d4 100%);
      border: 1px solid #707070;
      border-radius: 2px;
      width: 16px;
      height: 14px;
      font-size: 9px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      padding: 0;
    `;

    const maxBtn = document.createElement('button');
    maxBtn.className = 'max-btn';
    maxBtn.textContent = '🗖';
    maxBtn.title = 'Maximizar';
    maxBtn.style.cssText = `
      background: linear-gradient(180deg, #f0f0f0 0%, #d4d4d4 100%);
      border: 1px solid #707070;
      border-radius: 2px;
      width: 16px;
      height: 14px;
      font-size: 9px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      padding: 0;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Cerrar';

    windowBtnsWrap.append(minBtn, maxBtn, closeBtn);
    titleBar.append(windowBtnsWrap);

    const content = document.createElement('div');
    content.className = isLab ? 'window-content panel-body' : 'window-content';
    content.style.height = 'calc(100% - 28px)';
    content.style.overflow = 'hidden';
    content.style.boxSizing = 'border-box';
    
    if (bodyEl) content.append(bodyEl);
    else content.innerHTML = def.body || '';

    el.append(titleBar, content);
    document.body.append(el);
    bringToFront(el);
    
    if (!isLab) {
      makeDraggable(el, titleBar);
      makeResizableFull(el);
    }

    if (type === 'paint') {
      initPaintCanvas(content);
      activateAranavirus();
    } else if (type === 'player') {
      initPlayerUI(content);
    } else if (type === 'youtube') {
      initYoutubeVideo(content);
    } else if (type === 'powerpoint') {
      initPowerPoint(content);
    }

    let isMinimized = false;
    let taskbarTab = null;

    const minimizeWindow = () => {
      if (isMinimized) return;
      isMinimized = true;
      el.style.transform = 'scale(0.05) translateY(450px)';
      el.style.opacity = '0';
      setTimeout(() => {
        if (isMinimized) el.style.display = 'none';
      }, 220);
      if (taskbarTab) taskbarTab.style.background = 'linear-gradient(180deg, #254d8c 0%, #133368 100%)';
    };

    const restoreWindow = () => {
      if (!isMinimized) return;
      el.style.display = 'block';
      el.style.transform = 'scale(0.05) translateY(450px)';
      el.style.opacity = '0';
      bringToFront(el);
      
      requestAnimationFrame(() => {
        el.style.transform = 'scale(1) translateY(0)';
        el.style.opacity = '1';
      });

      isMinimized = false;
      if (taskbarTab) taskbarTab.style.background = 'linear-gradient(180deg, #3c72c4 0%, #1c4b9e 100%)';
    };

    let isMaximized = false;
    let preMaxBounds = null;

    const maximizeWindow = () => {
      if (isMaximized) return;
      preMaxBounds = {
        left: el.style.left,
        top: el.style.top,
        width: el.style.width,
        height: el.style.height,
      };
      const taskbarH = (bar && bar.offsetHeight) || 30;
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.width = '100vw';
      el.style.height = `calc(100vh - ${taskbarH}px)`;
      el.dataset.maximized = 'true';
      isMaximized = true;
      maxBtn.textContent = '🗗';
      maxBtn.title = 'Restaurar';
      bringToFront(el);
    };

    const unmaximizeWindow = () => {
      if (!isMaximized || !preMaxBounds) return;
      el.style.left = preMaxBounds.left;
      el.style.top = preMaxBounds.top;
      el.style.width = preMaxBounds.width;
      el.style.height = preMaxBounds.height;
      delete el.dataset.maximized;
      isMaximized = false;
      maxBtn.textContent = '🗖';
      maxBtn.title = 'Maximizar';
    };

    const toggleMaximize = () => {
      if (isMaximized) unmaximizeWindow();
      else maximizeWindow();
    };

    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow();
    });

    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximize();
    });

    titleBar.addEventListener('dblclick', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      toggleMaximize();
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(id);
    });

    // Create Taskbar Tab for regular windows
    if (!isLab) {
      taskbarTab = document.createElement('button');
      taskbarTab.style.cssText = `
        background: linear-gradient(180deg, #3c72c4 0%, #1c4b9e 100%);
        border: 1px solid #16366f;
        border-radius: 3px;
        color: #fff;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        max-width: 140px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);
      `;
      const tabBadgeClass = ICON_BADGE_CLASS[type] || '';
      taskbarTab.innerHTML = `<span class="icon-badge icon-badge--sm ${tabBadgeClass}">${def.icon}</span> <span style="overflow: hidden; text-overflow: ellipsis;">${title || def.title}</span>`;
      
      taskbarTab.addEventListener('click', () => {
        if (isMinimized) {
          restoreWindow();
        } else {
          // Check if it's currently the topmost window
          const activeZ = Number(window.getComputedStyle(el).zIndex);
          if (activeZ >= zTop) {
            minimizeWindow();
          } else {
            bringToFront(el);
          }
        }
      });

      taskbarAppsContainer.append(taskbarTab);
    }

    openWindows.set(id, { el, type, isDropTarget: !isLab, taskbarTab, minimize: minimizeWindow, restore: restoreWindow });
    return id;
  }

  function closeWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;
    if (entry.taskbarTab) entry.taskbarTab.remove();
    entry.el.remove();
    openWindows.delete(id);
  }

  function getWindowAt(clientX, clientY) {
    const entries = [...openWindows.entries()]
      .filter(([, v]) => v.isDropTarget && v.el.style.display !== 'none' && parseFloat(v.el.style.opacity || '1') > 0.1)
      .sort((a, b) => Number(b[1].el.style.zIndex) - Number(a[1].el.style.zIndex));

    for (const [id, entry] of entries) {
      const rect = entry.el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return { windowId: id, windowType: entry.type };
      }
    }
    return null;
  }

  const desktop = document.createElement('div');
  desktop.className = 'desktop-icons';
  document.body.append(desktop);

  Object.keys(WINDOW_DEFS).forEach((type) => {
    const def = WINDOW_DEFS[type];
    const badgeClass = ICON_BADGE_CLASS[type] || '';
    const icon = document.createElement('button');
    icon.className = 'desktop-icon';
    icon.innerHTML = `<span class="glyph icon-badge ${badgeClass}">${def.icon}</span><span>${def.title}</span>`;
    icon.addEventListener('click', () => openWindow(type));
    desktop.append(icon);
  });

  let labWindowId = null;
  let labOpen = false;

  function toggleLab(e) {
    if (labOpen) {
      closeWindow(labWindowId);
      labWindowId = null;
      labOpen = false;
      return;
    }
    const content = document.createElement('div');
    labWindowId = openWindow('lab', { title: '⚙️ Panel de control', bodyEl: content, isLab: true, startButtonEl: startBtn });
    buildStartMenuContent(content);
    labOpen = true;
  }

  const bar = document.createElement('div');
  bar.className = 'taskbar';
  const startBtn = document.createElement('button');
  startBtn.className = 'start-btn';
  startBtn.innerHTML = `
    <span class="xp-flag"><span></span><span></span><span></span><span></span></span>
    <span>start</span>
  `;
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLab(e);
  });

  bar.append(startBtn, taskbarAppsContainer);

  const tray = document.createElement('div');
  tray.className = 'systray';
  tray.innerHTML = `<span title="Volumen">🔊</span><span title="Red">📶</span>`;

  const clock = document.createElement('div');
  clock.className = 'clock';
  function tick() {
    const now = new Date();
    clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  tick();
  setInterval(tick, 1000 * 15);

  bar.append(tray, clock);
  document.body.append(bar);

  // Click outside to close start menu
  window.addEventListener('pointerdown', (e) => {
    if (labOpen && labWindowId) {
      const entry = openWindows.get(labWindowId);
      if (entry && entry.el && !entry.el.contains(e.target) && !startBtn.contains(e.target)) {
        closeWindow(labWindowId);
        labWindowId = null;
        labOpen = false;
      }
    }
  });

  return { getWindowAt };
}