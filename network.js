/**
 * Gestión de la visualización de redes
 * Controla la visibilidad de capas y la interacción con el modelo
 */

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

const appState = {
    currentFloor: -1,  // -1 = todos los pisos
    separatedFloors: false,
    separationGap: 0,
    targetSeparation: 0,
    currentView: 'iso'
};

// ============================================
// GESTIÓN DE CAPAS
// ============================================

/**
 * Alterna la visibilidad de una capa
 * @param {string} layerName - Nombre de la capa (walls, cabling, furniture, labels)
 * @param {boolean} visible - Estado de visibilidad
 */
function toggleLayer(layerName, visible) {
    layers[layerName].forEach(object => {
        object.visible = visible;
    });
}

/**
 * Muestra u oculta todas las capas según los botones
 */
function updateLayersFromUI() {
    document.querySelectorAll('[data-layer]').forEach(button => {
        const layerName = button.dataset.layer;
        const isVisible = button.classList.contains('on');
        toggleLayer(layerName, isVisible);
    });
}

// ============================================
// GESTIÓN DE PISOS
// ============================================

/**
 * Actualiza la visibilidad de los pisos
 */
function updateFloorVisibility() {
    floors.forEach((floor, index) => {
        floor.visible = appState.currentFloor < 0 || appState.currentFloor === index;
    });
    
    if (roof) {
        roof.visible = appState.currentFloor < 0 || appState.currentFloor === 2;
    }
}

/**
 * Actualiza la posición de los pisos (para el efecto de separación)
 */
function updateFloorPositions() {
    const H = BUILDING_CONFIG.floorHeight;
    const SL = BUILDING_CONFIG.slabThickness;
    
    floors.forEach((floor, index) => {
        floor.position.y = index * (H + SL) + index * appState.separationGap;
    });
    
    const top = 2 * (H + SL) + 2 * appState.separationGap + H;
    
    if (roof) {
        roof.position.y = top + SL / 2;
    }
    
    if (riser) {
        riser.scale.y = top;
        riser.position.y = top / 2;
    }
    
    if (fiber) {
        fiber.scale.y = top;
        fiber.position.y = top / 2;
    }
    
    // Actualizar posición de la etiqueta del riser
    const riserLabel = layers.labels.find(l => l.userData && l.userData.isRiserLabel);
    if (riserLabel) {
        riserLabel.position.set(-9.2, top + 1.6, -4.55);
    }
}

/**
 * Establece el piso actual
 * @param {number} floorIndex - Índice del piso (-1 para todos)
 */
function setCurrentFloor(floorIndex) {
    appState.currentFloor = floorIndex;
    updateFloorVisibility();
    updateCameraTarget();
}

// ============================================
// GESTIÓN DE LA CÁMARA
// ============================================

/**
 * Configuración de la cámara
 */
const cameraState = {
    target: new THREE.Vector3(0, 5, 0),
    targetTheta: 0.7,
    targetPhi: 1.0,
    targetRadius: 46,
    current: {
        theta: 0.7,
        phi: 1.0,
        radius: 46
    }
};

/**
 * Actualiza el objetivo de la cámara según el piso actual
 */
function updateCameraTarget() {
    const H = BUILDING_CONFIG.floorHeight;
    const SL = BUILDING_CONFIG.slabThickness;
    
    if (appState.currentFloor < 0) {
        // Todos los pisos
        cameraState.target.y = 5.5 + appState.separationGap;
    } else {
        // Piso específico
        cameraState.target.y = appState.currentFloor * (H + SL + appState.separationGap) + 1.5;
    }
}

/**
 * Establece una vista predefinida
 * @param {string} viewName - Nombre de la vista (iso, top, side, front)
 */
function setView(viewName) {
    const view = VIEW_CONFIG.views[viewName];
    
    if (view) {
        cameraState.targetTheta = view.theta;
        cameraState.targetPhi = view.phi;
        cameraState.targetRadius = view.radius;
        
        if (viewName === 'front') {
            cameraState.targetTheta = Math.PI / 2;
        } else {
            cameraState.targetTheta = view.theta;
        }
        
        appState.currentView = viewName;
        updateCameraTarget();
    }
}

/**
 * Actualiza la posición de la cámara
 */
function updateCamera() {
    const p = cameraState.current;
    
    // Interpolación suave
    p.theta += (cameraState.targetTheta - p.theta) * 0.12;
    p.phi += (cameraState.targetPhi - p.phi) * 0.12;
    p.radius += (cameraState.targetRadius - p.radius) * 0.12;
    cameraState.target.lerp(cameraState.target, 0.12);
    
    // Calcular posición de la cámara
    camera.position.set(
        cameraState.target.x + p.radius * Math.sin(p.phi) * Math.sin(p.theta),
        cameraState.target.y + p.radius * Math.cos(p.phi),
        cameraState.target.z + p.radius * Math.sin(p.phi) * Math.cos(p.theta)
    );
    
    camera.up.set(0, 1, 0);
    camera.lookAt(cameraState.target);
}

// ============================================
// ANIMACIÓN PRINCIPAL
// ============================================

/**
 * Función de animación principal
 */
function animate() {
    // Suavizar la separación entre pisos
    appState.separationGap += (appState.targetSeparation - appState.separationGap) * 0.1;
    
    if (Math.abs(appState.separationGap - appState.targetSeparation) > 0.01) {
        updateFloorPositions();
    }
    
    // Actualizar cámara
    updateCamera();
    
    // Renderizar
    renderer.render(scene, camera);
    
    requestAnimationFrame(animate);
}

// ============================================
// MANEJO DE EVENTOS
// ============================================

/**
 * Inicializa los controladores de eventos
 */
function initEventListeners() {
    // Redimensionamiento de la ventana
    window.addEventListener('resize', onWindowResize);
    
    // Botones de vista
    document.querySelectorAll('[data-view]').forEach(button => {
        button.onclick = () => {
            document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('on'));
            button.classList.add('on');
            setView(button.dataset.view);
        };
    });
    
    // Botones de piso
    document.querySelectorAll('[data-floor]').forEach(button => {
        button.onclick = () => {
            document.querySelectorAll('[data-floor]').forEach(b => b.classList.remove('on'));
            button.classList.add('on');
            setCurrentFloor(parseInt(button.dataset.floor));
        };
    });
    
    // Botones de capa
    document.querySelectorAll('[data-layer]').forEach(button => {
        button.onclick = () => {
            button.classList.toggle('on');
            const layerName = button.dataset.layer;
            const isVisible = button.classList.contains('on');
            toggleLayer(layerName, isVisible);
        };
    });
    
    // Botón de separar pisos
    document.getElementById('separate-floors').onclick = function() {
        this.classList.toggle('on');
        appState.targetSeparation = this.classList.contains('on') ? 4 : 0;
    };
    
    // Eventos del canvas (para interacción táctil/ratón)
    const canvas = renderer.domElement;
    const pointers = new Map();
    let pointerDistance = 0;
    
    canvas.addEventListener('pointerdown', (e) => {
        pointers.set(e.pointerId, [e.clientX, e.clientY]);
        canvas.setPointerCapture(e.pointerId);
    });
    
    canvas.addEventListener('pointerup', (e) => {
        pointers.delete(e.pointerId);
    });
    
    canvas.addEventListener('pointermove', (e) => {
        if (!pointers.has(e.pointerId)) return;
        
        const oldPos = pointers.get(e.pointerId);
        const dx = e.clientX - oldPos[0];
        const dy = e.clientY - oldPos[1];
        pointers.set(e.pointerId, [e.clientX, e.clientY]);
        
        if (pointers.size === 2) {
            // Zoom con dos dedos
            const positions = [...pointers.values()];
            const currentDistance = Math.hypot(
                positions[0][0] - positions[1][0],
                positions[0][1] - positions[1][1]
            );
            if (pointerDistance) {
                cameraState.targetRadius = Math.min(
                    120,
                    Math.max(8, cameraState.targetRadius * pointerDistance / currentDistance)
                );
            }
            pointerDistance = currentDistance;
            return;
        }
        
        pointerDistance = 0;
        
        // Rotación de la cámara
        if (e.shiftKey || e.buttons === 2) {
            cameraState.target.y += dy * 0.05;
            return;
        }
        
        cameraState.targetTheta -= dx * 0.006;
        cameraState.targetPhi = Math.min(
            Math.PI / 2 + 0.4,
            Math.max(0.001, cameraState.targetPhi - dy * 0.006)
        );
        cameraState.current.theta = cameraState.targetTheta;
        cameraState.current.phi = cameraState.targetPhi;
    });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraState.targetRadius = Math.min(
            120,
            Math.max(8, cameraState.targetRadius * (1 + e.deltaY * 0.001))
        );
    }, { passive: false });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

/**
 * Maneja el redimensionamiento de la ventana
 */
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la aplicación
 */
function init() {
    // Crear escena y cámara
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 300);
    
    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.prepend(renderer.domElement);
    
    // Iluminación
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.9));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 15);
    scene.add(directionalLight);
    
    // Construir el edificio
    const building = buildBuilding();
    scene.add(building);
    
    // Crear techo y elementos verticales
    createRoofAndVerticalElements();
    scene.add(roof);
    scene.add(riser);
    scene.add(fiber);
    
    // Marcar la etiqueta del riser
    const riserLabel = layers.labels[layers.labels.length - 1];
    if (riserLabel) {
        riserLabel.userData = { isRiserLabel: true };
    }
    
    // Inicializar estado
    updateFloorVisibility();
    updateFloorPositions();
    updateCameraTarget();
    
    // Inicializar eventos
    initEventListeners();
    onWindowResize();
    
    // Iniciar animación
    animate();
}

// ============================================
// INICIO AUTOMÁTICO
// ============================================

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
