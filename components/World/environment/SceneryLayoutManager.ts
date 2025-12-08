/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SceneryLayoutManager - Centralized layout system for all scenery objects
 * Generates positions once at startup, no runtime collision checks
 */

import { LANE_WIDTH } from '../../../types';
import {
    SCENERY_LIMIT_Z,
    SCENERY_RESET_Z,
    LOOP_LENGTH
} from './constants';

// ============================================================================
// TYPES
// ============================================================================

export type SectionType = 'windmill_wheat' | 'greenhouse_tulip' | 'pasture';
export type BuildingType = 'windmill' | 'greenhouse' | null;
export type Side = 'left' | 'right';

export interface Position {
    x: number;
    z: number;
}

export interface Section {
    zStart: number;
    zEnd: number;
    type: SectionType;
    building: BuildingType;
    side: Side;
}

export interface BuildingPosition extends Position {
    type: 'windmill' | 'greenhouse';
    side: Side;
}

export interface CowPosition extends Position {
    rotationY: number;
    variant: 'black' | 'spotted_brown' | 'spotted_black' | 'brown';
    side: Side;
}

export interface TreePosition extends Position {
    scale: number;
    rotation: number;
    side: Side;
}

export interface SceneryLayout {
    sections: Section[];
    buildings: BuildingPosition[];
    cows: CowPosition[];
    trees: TreePosition[];
    // Row boundaries (distance from road edge)
    rows: {
        guardrail: { min: number; max: number };    // Row 0: 0-5
        nearField: { min: number; max: number };     // Row 1: 5-18
        midField: { min: number; max: number };      // Row 2: 19-28
        farField: { min: number; max: number };      // Row 3: 28-35
        forest: { min: number; max: number };        // Row 4: 40+
    };
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Section/Building interval
const SECTION_LENGTH = 200;

// Building patterns (W = windmill, G = greenhouse, null = empty section)
// ASYMMETRIC: Greenhouses never adjacent - at least 2 sections apart
// Left:  G - W - null - G - W - null (greenhouses at 0, 3)
// Right: W - G - null - W - G - null (greenhouses at 1, 4)
const LEFT_PATTERN: BuildingType[] = ['greenhouse', 'windmill', null, 'greenhouse', 'windmill', null];
const RIGHT_PATTERN: BuildingType[] = ['windmill', 'greenhouse', null, 'windmill', 'greenhouse', null];

// Row distances from road edge
const ROW_CONFIG = {
    guardrail: { min: 0, max: 5 },
    nearField: { min: 5, max: 18 },
    midField: { min: 19, max: 28 },
    farField: { min: 28, max: 35 },
    forest: { min: 75, max: 150 }  // Row 4: 75+ from road edge
};

// Cow configuration - spread across 2 rows (nearField and midField)
// Equal spacing on both sides
const COW_VARIANTS = ['black', 'spotted_brown', 'spotted_black', 'brown'] as const;
const COW_SPACING = [70, 70, 70, 70, 70]; // Interval 70

// Tree configuration
const TREES_PER_SECTION = 3;

// Exclusion zones
const WINDMILL_EXCLUSION = 15;
const GREENHOUSE_EXCLUSION = 12;
const COW_EXCLUSION = 3;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Seeded random for deterministic generation
const createSeededRandom = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
    };
};

// Simple pseudo-random from index
const pseudoRandom = (seed: number): number => {
    return ((seed * 2654435761) % 1000) / 1000;
};

// Get section type based on building
const getSectionType = (building: BuildingType): SectionType => {
    if (building === 'windmill') return 'windmill_wheat';
    if (building === 'greenhouse') return 'greenhouse_tulip';
    return 'pasture';
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateSceneryLayout = (laneCount: number, seed: number = 12345): SceneryLayout => {
    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const rng = createSeededRandom(seed);

    const sections: Section[] = [];
    const buildings: BuildingPosition[] = [];
    const cows: CowPosition[] = [];
    const trees: TreePosition[] = [];

    // ========================================================================
    // 1. Generate sections and buildings
    // ========================================================================
    const generateSide = (pattern: BuildingType[], side: Side) => {
        const xSign = side === 'left' ? -1 : 1;
        const buildingX = roadHalfWidth + (ROW_CONFIG.midField.min + ROW_CONFIG.midField.max) / 2;

        let z = SCENERY_LIMIT_Z;
        let index = 0;

        while (z > SCENERY_RESET_Z) {
            const building = pattern[index % pattern.length];
            const sectionType = getSectionType(building);

            // Add section
            sections.push({
                zStart: z,
                zEnd: z - SECTION_LENGTH,
                type: sectionType,
                building,
                side
            });

            // Add building position
            if (building) {
                buildings.push({
                    x: xSign * buildingX,
                    z,
                    type: building,
                    side
                });
            }

            z -= SECTION_LENGTH;
            index++;
        }
    };

    generateSide(LEFT_PATTERN, 'left');
    generateSide(RIGHT_PATTERN, 'right');

    // ========================================================================
    // 2. Generate cows (spread across row 1 nearField and row 2 midField)
    // ========================================================================
    const generateCows = (spacingPattern: number[], side: Side) => {
        const xSign = side === 'left' ? -1 : 1;
        // Two row positions for cows
        const cowXNear = roadHalfWidth + (ROW_CONFIG.nearField.min + ROW_CONFIG.nearField.max) / 2;
        const cowXMid = roadHalfWidth + (ROW_CONFIG.midField.min + ROW_CONFIG.midField.max) / 2;

        let z = SCENERY_LIMIT_Z;
        let index = 0;

        while (z > SCENERY_RESET_Z) {
            const seedVal = index * 1000 + (side === 'left' ? 1 : 0);

            const isNearBuilding = buildings.some(b =>
                b.side === side &&
                Math.abs(z - b.z) < (b.type === 'windmill' ? WINDMILL_EXCLUSION : GREENHOUSE_EXCLUSION)
            );

            // Check if cow is in a tulip section (greenhouse_tulip) - skip if so
            const isInTulipSection = sections.some(s =>
                s.side === side &&
                s.type === 'greenhouse_tulip' &&
                z <= s.zStart &&
                z > s.zEnd
            );

            if (!isNearBuilding && !isInTulipSection) {
                // 25% in nearField, 75% in midField
                const isNearRow = index % 4 === 0;
                const cowX = isNearRow ? cowXNear : cowXMid;

                cows.push({
                    x: xSign * (cowX + (pseudoRandom(seedVal + 1) - 0.5) * 3),
                    z,
                    rotationY: (side === 'left' ? 1.5 : -1.5) + (pseudoRandom(seedVal + 2) - 0.5) * 1.6,
                    variant: COW_VARIANTS[index % COW_VARIANTS.length],
                    side
                });
            }

            const spacing = spacingPattern[index % spacingPattern.length];
            z -= spacing;
            index++;
        }
    };

    generateCows(COW_SPACING, 'left');
    generateCows(COW_SPACING, 'right');

    // ========================================================================
    // 3. Generate single trees (row 2, scattered)
    // Skip sections with buildings entirely to avoid trees inside windmills
    // ========================================================================
    sections.forEach((section, sectionIndex) => {
        // Skip sections that have a building - no trees near windmills/greenhouses
        if (section.building) return;

        const xSign = section.side === 'left' ? -1 : 1;
        const treeXMin = roadHalfWidth + ROW_CONFIG.midField.min;
        const treeXMax = roadHalfWidth + ROW_CONFIG.midField.max;

        for (let i = 0; i < TREES_PER_SECTION; i++) {
            const treeSeed = sectionIndex * 100 + i;
            const treeRng = createSeededRandom(treeSeed);

            // Calculate position
            const treeZ = section.zStart - treeRng() * SECTION_LENGTH;
            const treeX = xSign * (treeXMin + treeRng() * (treeXMax - treeXMin));

            // Check if too close to any building from adjacent sections
            const tooCloseToBuilding = buildings.some(b =>
                b.side === section.side &&
                Math.abs(treeZ - b.z) < 30 &&
                Math.abs(Math.abs(treeX) - Math.abs(b.x)) < 20
            );

            if (!tooCloseToBuilding) {
                trees.push({
                    x: treeX,
                    z: treeZ,
                    scale: 0.8 + treeRng() * 0.4,
                    rotation: treeRng() * Math.PI * 2,
                    side: section.side
                });
            }
        }
    });

    return {
        sections,
        buildings,
        cows,
        trees,
        rows: ROW_CONFIG
    };
};

// ============================================================================
// POSITION GENERATORS FOR INSTANCED MESHES
// ============================================================================

/**
 * Generate positions for tulips in greenhouse_tulip sections
 */
export const generateTulipPositions = (
    layout: SceneryLayout,
    count: number,
    laneCount: number,
    seed: number = 54321
): Position[] => {
    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const rng = createSeededRandom(seed);
    const positions: Position[] = [];

    // Filter tulip sections
    const tulipSections = layout.sections.filter(s => s.type === 'greenhouse_tulip');
    if (tulipSections.length === 0) return positions;

    const positionsPerSection = Math.ceil(count / tulipSections.length);

    tulipSections.forEach(section => {
        const xSign = section.side === 'left' ? -1 : 1;
        const xMin = roadHalfWidth + layout.rows.nearField.min;
        const xMax = roadHalfWidth + layout.rows.nearField.max; // Narrower range for denser tulip field

        for (let i = 0; i < positionsPerSection && positions.length < count; i++) {
            const x = xSign * (xMin + rng() * (xMax - xMin));
            const z = section.zEnd + rng() * SECTION_LENGTH;

            // Skip if too close to building
            const tooCloseToBuilding = layout.buildings.some(b =>
                b.side === section.side &&
                Math.abs(z - b.z) < (b.type === 'windmill' ? WINDMILL_EXCLUSION : GREENHOUSE_EXCLUSION) &&
                Math.abs(Math.abs(x) - Math.abs(b.x)) < 10
            );

            if (!tooCloseToBuilding) {
                positions.push({ x, z });
            }
        }
    });

    return positions;
};

/**
 * Generate positions for wheat in windmill_wheat sections
 */
export const generateWheatPositions = (
    layout: SceneryLayout,
    count: number,
    laneCount: number,
    seed: number = 98765
): Position[] => {
    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const rng = createSeededRandom(seed);
    const positions: Position[] = [];

    // Filter wheat sections
    const wheatSections = layout.sections.filter(s => s.type === 'windmill_wheat');
    if (wheatSections.length === 0) return positions;

    const positionsPerSection = Math.ceil(count / wheatSections.length);

    wheatSections.forEach(section => {
        const xSign = section.side === 'left' ? -1 : 1;
        const xMin = roadHalfWidth + layout.rows.nearField.min;
        const xMax = roadHalfWidth + layout.rows.farField.max;

        for (let i = 0; i < positionsPerSection && positions.length < count; i++) {
            const x = xSign * (xMin + rng() * (xMax - xMin));
            const z = section.zEnd + rng() * SECTION_LENGTH;

            // Skip if too close to windmill
            const tooCloseToWindmill = layout.buildings.some(b =>
                b.type === 'windmill' &&
                b.side === section.side &&
                Math.abs(z - b.z) < WINDMILL_EXCLUSION &&
                Math.abs(Math.abs(x) - Math.abs(b.x)) < 15
            );

            if (!tooCloseToWindmill) {
                positions.push({ x, z });
            }
        }
    });

    return positions;
};

/**
 * Generate positions for grass/bushes in pasture sections
 */
export const generatePasturePositions = (
    layout: SceneryLayout,
    count: number,
    laneCount: number,
    seed: number = 11111
): Position[] => {
    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const rng = createSeededRandom(seed);
    const positions: Position[] = [];

    // Filter pasture sections
    const pastureSections = layout.sections.filter(s => s.type === 'pasture');
    if (pastureSections.length === 0) {
        // If no pasture sections, distribute across all sections
        const allSections = layout.sections;
        const positionsPerSection = Math.ceil(count / allSections.length);

        allSections.forEach(section => {
            const xSign = section.side === 'left' ? -1 : 1;
            const xMin = roadHalfWidth + layout.rows.nearField.min;
            const xMax = roadHalfWidth + layout.rows.nearField.max;

            for (let i = 0; i < positionsPerSection && positions.length < count; i++) {
                positions.push({
                    x: xSign * (xMin + rng() * (xMax - xMin)),
                    z: section.zEnd + rng() * SECTION_LENGTH
                });
            }
        });
        return positions;
    }

    const positionsPerSection = Math.ceil(count / pastureSections.length);

    pastureSections.forEach(section => {
        const xSign = section.side === 'left' ? -1 : 1;
        const xMin = roadHalfWidth + layout.rows.nearField.min;
        const xMax = roadHalfWidth + layout.rows.midField.max;

        for (let i = 0; i < positionsPerSection && positions.length < count; i++) {
            const x = xSign * (xMin + rng() * (xMax - xMin));
            const z = section.zEnd + rng() * SECTION_LENGTH;

            // Skip if too close to cow
            const tooCloseToCow = layout.cows.some(c =>
                c.side === section.side &&
                Math.abs(z - c.z) < COW_EXCLUSION &&
                Math.abs(Math.abs(x) - Math.abs(c.x)) < COW_EXCLUSION
            );

            if (!tooCloseToCow) {
                positions.push({ x, z });
            }
        }
    });

    return positions;
};

/**
 * Generate positions for forest trees (row 4)
 */
export const generateForestPositions = (
    layout: SceneryLayout,
    count: number,
    laneCount: number,
    seed: number = 77777
): Position[] => {
    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const rng = createSeededRandom(seed);
    const positions: Position[] = [];

    const xMin = roadHalfWidth + layout.rows.forest.min;
    const xMax = roadHalfWidth + layout.rows.forest.max;

    const perSide = count / 2;

    // Left side
    for (let i = 0; i < perSide; i++) {
        positions.push({
            x: -(xMin + rng() * (xMax - xMin)),
            z: SCENERY_RESET_Z + rng() * LOOP_LENGTH
        });
    }

    // Right side
    for (let i = 0; i < perSide; i++) {
        positions.push({
            x: xMin + rng() * (xMax - xMin),
            z: SCENERY_RESET_Z + rng() * LOOP_LENGTH
        });
    }

    return positions;
};

/**
 * Generate guardrail segments (row 0)
 */
export const generateGuardrailPositions = (
    layout: SceneryLayout,
    segmentLength: number,
    laneCount: number
): Position[] => {
    const roadHalfWidth = (laneCount * LANE_WIDTH) / 2;
    const positions: Position[] = [];
    const guardrailX = roadHalfWidth + (layout.rows.guardrail.min + layout.rows.guardrail.max) / 2;

    for (let z = SCENERY_LIMIT_Z; z > SCENERY_RESET_Z; z -= segmentLength) {
        // Left guardrail
        positions.push({ x: -guardrailX, z });
        // Right guardrail
        positions.push({ x: guardrailX, z });
    }

    return positions;
};
