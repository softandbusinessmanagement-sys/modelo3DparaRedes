/**
 * Utilidades para el modelo 3D
 * Funciones auxiliares reutilizables
 */

// ============================================
// CREACIÓN DE MATERIALES
// ============================================

/**
 * Crea un material MeshLambertMaterial
 * @param {number} color - Color en formato hexadecimal (ej: 0xff0000)
 * @param {Object} options - Opciones adicionales para el material
 * @returns {THREE.MeshLambertMaterial}
 */
function createLambertMaterial(color, options = {}) {
    return new THREE.MeshLambertMaterial(Object.assign({ color: color }, options));
}

/**
 * Crea un material MeshBasicMaterial
 * @param {number} color - Color en formato hexadecimal
 * @param {Object} options - Opciones adicionales
 * @returns {THREE.MeshBasicMaterial}
 */
function createBasicMaterial(color, options = {}) {
    return new THREE.MeshBasicMaterial(Object.assign({ color: color }, options));
}

// ============================================
// CREACIÓN DE GEOMETRÍAS
// ============================================

/**
 * Crea una caja (BoxGeometry) con material y posición
 * @param {number} width - Ancho
 * @param {number} height - Alto
 * @param {number} depth - Profundidad
 * @param {THREE.Material} material - Material a aplicar
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} z - Posición Z
 * @param {THREE.Group} parent - Grupo padre (opcional, default: escena)
 * @returns {THREE.Mesh}
 */
function createBox(width, height, depth, material, x, y, z, parent = null) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );
    box.position.set(x, y, z);
    if (parent) {
        parent.add(box);
    } else {
        scene.add(box);
    }
    return box;
}

/**
 * Crea una línea entre dos puntos
 * @param {Array} start - Punto inicial [x, y, z]
 * @param {Array} end - Punto final [x, y, z]
 * @param {THREE.Material} material - Material de la línea
 * @param {THREE.Group} parent - Grupo padre
 * @returns {THREE.Line}
 */
function createLine(start, end, material, parent) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
        start[0], start[1], start[2],
        end[0], end[1], end[2]
    ]);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, material);
    parent.add(line);
    return line;
}

/**
 * Crea múltiples líneas segmentadas
 * @param {Array} points - Array de puntos [x, y, z, x, y, z, ...]
 * @param {THREE.Material} material - Material de las líneas
 * @param {THREE.Group} parent - Grupo padre
 * @returns {THREE.LineSegments}
 */
function createLineSegments(points, material, parent) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const lineSegments = new THREE.LineSegments(geometry, material);
    parent.add(lineSegments);
    return lineSegments;
}

// ============================================
// CREACIÓN DE ETIQUETAS
// ============================================

/**
 * Crea una etiqueta de texto como sprite
 * @param {string} title - Texto principal
 * @param {string} subtitle - Subtítulo (opcional)
 * @param {string} color - Color del borde (#hex)
 * @returns {THREE.Sprite}
 */
function createLabel(title, subtitle = '', color = '#29a8ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Fondo
    context.fillStyle = 'rgba(10, 20, 30, 0.82)';
    context.fillRect(0, 0, 512, 128);
    
    // Borde
    context.strokeStyle = color;
    context.lineWidth = 6;
    context.strokeRect(3, 3, 506, 122);
    
    // Título
    context.fillStyle = '#fff';
    context.font = 'bold 44px Arial';
    context.textAlign = 'center';
    context.fillText(title, 256, 60);
    
    // Subtítulo
    context.fillStyle = '#9fd';
    context.font = '32px Arial';
    context.fillText(subtitle, 256, 106);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4.4, 1.1, 1);
    sprite.renderOrder = 9;
    
    return sprite;
}

// ============================================
// FUNCIONES DE POSICIÓN
// ============================================

/**
 * Calcula la posición central de un salón
 * @param {number} roomIndex - Índice del salón (0, 1, 2)
 * @returns {number} - Posición X central
 */
function getRoomCenterX(roomIndex) {
    // Los salones están separados por 8 unidades, comenzando en -12
    return -8 + 8 * roomIndex;
}
