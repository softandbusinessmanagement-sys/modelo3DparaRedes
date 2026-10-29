/**
 * Construcción del edificio
 * Crea la estructura física del pabellón: pisos, salones, muros, etc.
 */

// ============================================
// MATERIALES GLOBALES
// ============================================

const materials = {
    slab: createLambertMaterial(MATERIAL_COLORS.slab),
    wall: createLambertMaterial(MATERIAL_COLORS.wall, {
        transparent: true,
        opacity: 0.2,
        depthWrite: false
    }),
    door: createLambertMaterial(MATERIAL_COLORS.door),
    desk: createLambertMaterial(MATERIAL_COLORS.desk),
    partition: createLambertMaterial(MATERIAL_COLORS.partition),
    pc: createLambertMaterial(MATERIAL_COLORS.pc),
    screen: new THREE.MeshBasicMaterial({ color: MATERIAL_COLORS.screen }),
    cabinet: createLambertMaterial(MATERIAL_COLORS.cabinet)
};

// ============================================
// CAPAS (Para mostrar/ocultar)
// ============================================

const layers = {
    walls: [],
    cabling: [],
    furniture: [],
    labels: []
};

// ============================================
// GRUPOS DE PISOS
// ============================================

const floors = [];

// ============================================
// CONSTRUCCIÓN DE UN SALÓN
// ============================================

/**
 * Construye un salón con su mobiliario
 * @param {THREE.Group} floorGroup - Grupo del piso
 * @param {number} floorIndex - Índice del piso (0, 1, 2)
 * @param {number} roomIndex - Índice del salón (0, 1, 2)
 * @param {number} centerX - Posición X central del salón
 * @param {number} startX - Posición X de inicio (para cableado)
 * @param {Function} addCablePoint - Función para agregar puntos de cable
 * @returns {void}
 */
function buildRoom(floorGroup, floorIndex, roomIndex, centerX, startX, addCablePoint) {
    const H = BUILDING_CONFIG.floorHeight;
    const SL = BUILDING_CONFIG.slabThickness;
    const dr = floorGroup.userData.dr || [];
    floorGroup.userData.dr = dr;
    
    /**
     * Añade un objeto a la capa de mobiliario
     * @param {THREE.Object3D} object
     */
    function addFurniture(object) {
        layers.furniture.push(object);
        return object;
    }
    
    // Paredes laterales del salón
    [-4.9, 0, 4.9].forEach(z => {
        layers.walls.push(createBox(
            0.5, H, 0.5, materials.slab,
            centerX - 4, H / 2, z, floorGroup
        ));
    });
    
    // Pared frontal (solo para salón 2, el del centro)
    if (roomIndex == 1) {
        [-4.9, 0, 4.9].forEach(z => {
            layers.walls.push(createBox(
                0.5, H, 0.5, materials.slab,
                centerX + 4, H / 2, z, floorGroup
            ));
        });
    }
    
    // Puerta
    layers.walls.push(createBox(
        0.08, 2.1, 0.9, materials.door,
        centerX + 4, 1.05, -3.7, floorGroup
    ));
    
    // Mesas y equipos por fila (5 filas)
    for (let k = 0; k < 5; k++) {
        const z = -2.9 + k * 1.7;
        
        // Dos bloques de mesas por fila
        [[centerX - 3.4, 2.6], [centerX + 0.9, 2.6]].forEach(block => {
            // Tablero de la mesa
            addFurniture(createBox(
                block[1], 0.05, 0.8, materials.desk,
                block[0] + block[1] / 2, 0.75, z - 0.1, floorGroup
            ));
            
            // Patas de la mesa
            [block[0] + 0.05, block[0] + block[1] - 0.05].forEach(x => {
                addFurniture(createBox(
                    0.05, 0.75, 0.7, materials.desk,
                    x, 0.37, z - 0.1, floorGroup
                ));
            });
            
            // 4 puestos por bloque
            for (let i = 0; i < 4; i++) {
                const px = block[0] + 0.4 + i * 0.68;
                
                // Punto RJ45
                layers.cabling.push(createBox(
                    0.14, 0.14, 0.05, new THREE.MeshBasicMaterial({ color: MATERIAL_COLORS.rj45Point }),
                    px, 0.5, z + 0.3, floorGroup
                ));
                
                // Cable desde el punto a la canaleta
                dr.push(px, 0.5, z + 0.3, px, 0.12, z + 0.5);
                
                // Equipos según el piso
                if (floorIndex == 0) {
                    // Piso 1: Computadoras de escritorio
                    addFurniture(createBox(
                        0.34, 0.24, 0.03, materials.pc,
                        px, 0.95, z - 0.2, floorGroup
                    ));
                    addFurniture(createBox(
                        0.12, 0.2, 0.2, materials.pc,
                        px + 0.28, 0.85, z - 0.15, floorGroup
                    ));
                    if (i < 3) {
                        addFurniture(createBox(
                            0.03, 0.4, 0.7, materials.partition,
                            px + 0.34, 0.95, z - 0.1, floorGroup
                        ));
                    }
                } else {
                    // Pisos 2 y 3: Laptops
                    addFurniture(createBox(
                        0.3, 0.02, 0.22, materials.pc,
                        px, 0.79, z - 0.1, floorGroup
                    ));
                    const screen = createBox(
                        0.3, 0.2, 0.02, materials.screen,
                        px, 0.89, z - 0.22, floorGroup
                    );
                    screen.rotation.x = -0.25;
                    addFurniture(screen);
                }
            }
        });
        
        // Conexión de cableado horizontal
        addCablePoint([startX, 0.12, z + 0.5], [centerX + 3.5, 0.12, z + 0.5]);
    }
    
    // Conexión vertical de la columna
    addCablePoint([startX, 0.12, -4.4], [startX, 0.12, 4.4]);
    
    // Mesa del profesor (solo en salón 0)
    if (roomIndex == 0) {
        addFurniture(createBox(
            2, 0.06, 0.8, materials.desk,
            centerX - 1.2, 0.75, -4.2, floorGroup
        ));
        addFurniture(createBox(
            0.5, 0.12, 0.35, materials.pc,
            centerX - 1.2, 0.84, -4.2, floorGroup
        ));
        
        if (floorIndex == 0) {
            addFurniture(createBox(
                2.4, 1, 0.6, materials.desk,
                centerX + 2, 0.5, -4.3, floorGroup
            ));
        }
    }
    
    // Estantería (solo en piso 0, salón 1)
    if (floorIndex == 0 && roomIndex == 1) {
        for (let i = 0; i < 4; i++) {
            addFurniture(createBox(
                0.35, 1.5, 0.45, materials.partition,
                centerX + 3.75, 0.75, -1.5 + i * 0.6, floorGroup
            ));
        }
    }
}

// ============================================
// CONSTRUCCIÓN COMPLETA DEL EDIFICIO
// ============================================

/**
 * Construye el edificio completo
 * @returns {THREE.Group} - Grupo que contiene todo el edificio
 */
function buildBuilding() {
    const buildingGroup = new THREE.Group();
    const H = BUILDING_CONFIG.floorHeight;
    const SL = BUILDING_CONFIG.slabThickness;
    const W = BUILDING_CONFIG.width;
    const D = BUILDING_CONFIG.depth;
    
    // Construir cada piso
    for (let f = 0; f < BUILDING_CONFIG.floorCount; f++) {
        const floorGroup = new THREE.Group();
        buildingGroup.add(floorGroup);
        floors.push(floorGroup);
        
        // Losa del piso
        createBox(W, SL, D, materials.slab, 0, -SL / 2, 0, floorGroup);
        
        // Suelo de cada salón
        for (let r = 0; r < BUILDING_CONFIG.roomsPerFloor; r++) {
            const cx = getRoomCenterX(r);
            createBox(7.9, 0.02, 9.9, 
                createLambertMaterial(MATERIAL_COLORS.floorColors[f]),
                cx, 0.02, 0, floorGroup
            );
        }
        
        // Muros exteriores
        const wallPositions = [
            [W, 0.2, 0, -D / 2],
            [W, 0.2, 0, D / 2]
        ];
        wallPositions.forEach(pos => {
            layers.walls.push(createBox(
                pos[0], H, pos[2], materials.wall,
                pos[2], H / 2, pos[3], floorGroup
            ));
        });
        
        // Muros divisores verticales
        [-12, -4, 4, 12].forEach(x => {
            layers.walls.push(createBox(
                0.2, H, D, materials.wall,
                x, H / 2, 0, floorGroup
            ));
        });
        
        // Líneas de contorno del piso
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)),
            new THREE.LineBasicMaterial({ color: 0x6a8097 })
        );
        edges.position.y = H / 2;
        floorGroup.add(edges);
        layers.walls.push(edges);
        
        // Gabinete de comunicaciones (solo en salón E1, x = -11.2)
        const cabinet = createBox(
            0.8, 1.9, 0.8, materials.cabinet,
            -11.2, 0.95, -4.2, floorGroup
        );
        
        // Etiqueta del gabinete
        const cabinetLabel = createLabel(
            'GAB-P' + (f + 1),
            f == 0 ? 'MDF principal + core' : 'Gabinete de piso',
            '#ff7a2f'
        );
        cabinetLabel.position.set(-9.2, 3.9, -4.2);
        floorGroup.add(cabinetLabel);
        layers.labels.push(cabinetLabel);
        
        // Etiqueta del piso
        const floorLabel = createLabel(
            NETWORK_CONFIG.floorNames[f],
            NETWORK_CONFIG.floorDescriptions[f]
        );
        floorLabel.position.set(0, H + 1.1, D / 2 + 0.3);
        floorGroup.add(floorLabel);
        layers.labels.push(floorLabel);
        
        // Construir cada salón
        const cablePoints = [];
        const addCablePoint = (start, end) => {
            cablePoints.push(...start, ...end);
        };
        
        for (let r = 0; r < BUILDING_CONFIG.roomsPerFloor; r++) {
            const cx = getRoomCenterX(r);
            const sx = cx - 3.75;
            
            // Canaleta troncal horizontal (pasa por E1, E2, E3)
            const trunking = createBox(
                22.8, 0.14, 0.2, 
                new THREE.MeshBasicMaterial({ color: MATERIAL_COLORS.cabling }),
                0, 2.6, -4.75, floorGroup
            );
            trunking.userData.isCabling = true;
            layers.cabling.push(trunking);
            
            // Bajante del salón
            const drop = createBox(
                0.12, 2.6, 0.12,
                new THREE.MeshBasicMaterial({ color: MATERIAL_COLORS.cabling }),
                sx, 1.3, -4.75, floorGroup
            );
            layers.cabling.push(drop);
            
            // Cable horizontal en Z
            const horizontalCable = createBox(
                0.1, 0.1, 8.4,
                new THREE.MeshBasicMaterial({ color: MATERIAL_COLORS.cabling }),
                sx, 0.12, -0.35, floorGroup
            );
            layers.cabling.push(horizontalCable);
            
            // Etiqueta del salón
            const roomLabel = createLabel(
                'P' + (f + 1) + '-E' + (r + 1),
                'VLAN ' + NETWORK_CONFIG.vlanMatrix[f][r] + ' · 40 pts',
                '#29a8ff'
            );
            roomLabel.position.set(cx, H + 0.5, -D / 2 + 0.2);
            roomLabel.scale.set(3.4, 0.85, 1);
            floorGroup.add(roomLabel);
            layers.labels.push(roomLabel);
            
            // Construir el salón
            buildRoom(floorGroup, f, r, cx, sx, addCablePoint);
        }
        
        // Crear líneas de cableado STP (verdes)
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(cablePoints, 3));
        const lineSegments = new THREE.LineSegments(
            geometry,
            new THREE.LineBasicMaterial({ color: MATERIAL_COLORS.stpCable })
        );
        floorGroup.add(lineSegments);
        layers.cabling.push(lineSegments);
        
        // Crear líneas de cableado desde puntos (usando datos guardados)
        const dropGeometry = new THREE.BufferGeometry();
        dropGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(floorGroup.userData.dr || [], 3)
        );
        const dropLines = new THREE.LineSegments(
            dropGeometry,
            new THREE.LineBasicMaterial({ color: MATERIAL_COLORS.stpCable })
        );
        floorGroup.add(dropLines);
        layers.cabling.push(dropLines);
        
        // Punto de acceso WiFi en el techo de cada salón
        for (let r = 0; r < BUILDING_CONFIG.roomsPerFloor; r++) {
            const ap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
                createLambertMaterial(0xffffff)
            );
            ap.position.set(getRoomCenterX(r), H - 0.05, 0);
            floorGroup.add(ap);
            layers.cabling.push(ap);
        }
    }
    
    return buildingGroup;
}

// ============================================
// CONSTRUCCIÓN DEL TECHO Y ELEMENTOS VERTICALES
// ============================================

let roof = null;
let riser = null;
let fiber = null;

/**
 * Crea el techo y elementos verticales (riser y fibra)
 */
function createRoofAndVerticalElements() {
    const W = BUILDING_CONFIG.width;
    const D = BUILDING_CONFIG.depth;
    const SL = BUILDING_CONFIG.slabThickness;
    
    // Techo
    roof = createBox(
        W, SL, D, materials.slab,
        0, 0, 0
    );
    
    // Riser vertical (canaleta ancha)
    riser = createBox(
        0.55, 1, 0.55,
        createLambertMaterial(MATERIAL_COLORS.riser, {
            transparent: true,
            opacity: 0.85
        }),
        -11.65, 0, -4.55
    );
    
    // Fibra óptica (backbone)
    fiber = createBox(
        0.08, 1, 0.08,
        new THREE.MeshBasicMaterial({ color: MATERIAL_COLORS.fiber }),
        -11.35, 0, -4.55
    );
    
    // Etiqueta del riser
    const riserLabel = createLabel('RISER VERTICAL', 'Canaleta ancha + fibra', '#ffd23f');
    riserLabel.position.set(-9.2, 0, -4.55);
    scene.add(riserLabel);
    layers.labels.push(riserLabel);
}
