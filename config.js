/**
 * Configuración del Modelo 3D del Pabellón J
 * Contiene todas las constantes y parámetros configurables
 */

// ============================================
// DIMENSIONES DEL EDIFICIO
// ============================================

const BUILDING_CONFIG = {
    // Altura de cada piso
    floorHeight: 3,
    
    // Espesor de las losas entre pisos
    slabThickness: 0.25,
    
    // Dimensiones totales del edificio (ancho x profundidad)
    width: 24,
    depth: 10,
    
    // Número de pisos
    floorCount: 3,
    
    // Número de salones por piso
    roomsPerFloor: 3
};

// ============================================
// COLORES DE MATERIALES
// ============================================

const MATERIAL_COLORS = {
    // Estructura
    slab: 0xcfe0ff,
    wall: 0x9fb4c8,
    door: 0x8a5a2b,
    
    // Mobiliario
    desk: 0xc9b48a,
    partition: 0xa9b7c6,
    pc: 0x222a33,
    screen: 0x6fb8ff,
    
    // Redes y cableado
    cabling: 0x29a8ff,
    riser: 0xffd23f,
    fiber: 0x2ef2d0,
    cabinet: 0xff7a2f,
    rj45Point: 0xff5ad6,
    stpCable: 0x2eea5a,
    
    // Pisos por nivel
    floorColors: [0xcfe0ff, 0xcff5dc, 0xe6d8ff]
};

// ============================================
// CONFIGURACIÓN DE REDES
// ============================================

const NETWORK_CONFIG = {
    // Puntos RJ45 por salón
    rj45PointsPerRoom: 40,
    
    // VLANs por salón (matriz: [piso][salón])
    vlanMatrix: [
        [11, 12, 13],  // Piso 1
        [21, 22, 23],  // Piso 2
        [31, 32, 33]   // Piso 3
    ],
    
    // Nombres de los pisos
    floorNames: [
        'PISO 1 · ADMINISTRATIVA',
        'PISO 2 · LAB. LAPTOPS',
        'PISO 3 · AULAS DE REDES'
    ],
    
    // Descripción de los pisos
    floorDescriptions: [
        '24 × 10 m · 120 puntos',
        '24 × 10 m · 120 puntos',
        '24 × 10 m · 120 puntos'
    ]
};

// ============================================
// CONFIGURACIÓN DE VISUALIZACIÓN
// ============================================

const VIEW_CONFIG = {
    // Configuración de la cámara para diferentes vistas
    views: {
        iso: { theta: 0.7, phi: 1.0, radius: 46 },
        top: { theta: 0, phi: 0.001, radius: 44 },
        side: { theta: 0, phi: Math.PI / 2, radius: 60 },
        front: { theta: Math.PI / 2, phi: Math.PI / 2, radius: 60 }
    },
    
    // Separación entre pisos cuando se activan "Separar pisos"
    floorSeparation: 4
};

// ============================================
// EXPORTACIONES
// ============================================

// Exportar configuraciones para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BUILDING_CONFIG, MATERIAL_COLORS, NETWORK_CONFIG, VIEW_CONFIG };
}
