/**
 * Pabellón J – Modelo 3D de Redes
 * Punto de entrada principal de la aplicación
 * 
 * Este archivo importa y coordina todos los módulos del proyecto.
 * 
 * Autor: Original basado en el código de Josep
 * Versión: 1.0 (Reorganizado)
 */

// ============================================
// VARIABLES GLOBALES PRINCIPALES
// ============================================

// Escena Three.js
let scene = null;

// Cámara
let camera = null;

// Renderer
let renderer = null;

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

// El archivo network.js contiene la función init() que inicializa todo
// Esta función se ejecutará automáticamente cuando el DOM esté listo
// (ver el final de network.js)

// ============================================
// NOTAS
// ============================================

// La aplicación se inicializa automáticamente a través de network.js
// que contiene la función init() que es llamada cuando el DOM está listo.
// 
// Orden de carga:
// 1. index.html carga las dependencias (three.js, config.js, utils.js, building.js, network.js, main.js)
// 2. network.js define la función init() y la llama cuando el DOM está listo
// 3. init() en network.js llama a las funciones de building.js para construir el edificio
// 4. network.js también maneja la cámara, eventos y animación

console.log('Pabellón J – Modelo 3D de Redes: Inicializando...');
